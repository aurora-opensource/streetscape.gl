/* global WebSocket,ArrayBuffer */
/* eslint-disable camelcase */
import assert from 'assert';
import {
  XVIZStreamBuffer,
  StreamSynchronizer,
  parseStreamMessage,
  LOG_STREAM_MESSAGE
} from '@xviz/parser';
import PromiseRetry from 'promise-retry';

import XVIZLoaderInterface from './xviz-loader-interface';
import XVIZController from './xviz-controller-v2';

/**
 * Connect to XVIZ 2 websocket manage storage of XVIZ data into a XVIZStreamBuffer
 *
 * This class is a Websocket base class and is expected to be subclassed with
 * the following methods overridden:
 *
 * - _onOpen()
 * - _onXVIZTimeslice()
 */
export default class XVIZWebsocketLoader extends XVIZLoaderInterface {
  /**
   * constructor
   * @params serverConfig {object}
   *   - serverConfig.serverUrl {string}
   *   - serverConfig.defaultLogLength {number, optional} - default 30
   *   - serverConfig.queryParams {object, optional}
   *   - serverConfig.retryAttempts {number, optional} - default 3
   * @params worker {string|function, optional}
   * @params maxConcurrency {number, optional} - default 3
   * @params logGuid {string}
   * @params logProfile {string, optional}
   * @params duration {number, optional}
   * @params timestamp {number, optional}
   * @params bufferLength {number, optional}
   */
  constructor(options = {}) {
    super(options);

    this.socket = null;

    this.retrySettings = {
      retries: 3,
      minTimeout: 500,
      randomize: true
    };

    this.streamBuffer = new XVIZStreamBuffer();

    // Handler object for the websocket events
    // Note: needs to be last due to member dependencies
    this.WebSocketClass = options.WebSocketClass || WebSocket;
  }

  isOpen() {
    return this.socket; // && this.socket.readyState === WEB_SOCKET_OPEN_STATE;
  }

  seek(timestamp) {
    super.seek(timestamp);
  }

  /**
   * Open an XVIZ socket connection with automatic retry
   *
   * @returns {Promise} WebSocket connection
   */
  connect() {
    assert(this.socket === null, 'Socket Manager still connected');

    this._debug('stream_start');
    const {url} = this.requestParams;

    // Wrap retry logic around connection
    return PromiseRetry(retry => {
      return new Promise((resolve, reject) => {
        try {
          const ws = new this.WebSocketClass(url);
          ws.binaryType = 'arraybuffer';

          ws.onmessage = message => {
            const hasMetadata = Boolean(this.getMetadata());

            return parseStreamMessage({
              message: message.data,
              onResult: this._onWSMessage,
              onError: this._onWSError,
              debug: this._debug.bind('parse_message'),
              worker: hasMetadata && this.options.worker,
              maxConcurrency: this.options.maxConcurrency
            });
          };

          ws.onerror = this._onWSError;
          ws.onclose = event => {
            this._onWSClose(event);
            reject(event);
          };

          // On success, resolve the promise with the now ready socket
          ws.onopen = () => {
            this.socket = ws;
            this._onWSOpen();
            resolve(ws);
          };
        } catch (err) {
          reject(err);
        }
      }).catch(event => {
        this._onWSError(event);
        const isAbnormalClosure = event.code > 1000 && event.code !== 1005;

        // Retry if abnormal or connection never established
        if (isAbnormalClosure || !this.socket) {
          retry();
        }
      });
    }, this.retrySettings).catch(this._onWSError);
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // Subclasses *MUST* implement these methods
  _onOpen() {
    throw new Error('_onOpen() method must be overridden');
  }

  /**
   * Subclass hook for xviz message
   *
   * The messages will be inserted into the 'streamBuffer'
   * prior to this hook being called.
   *
   * @params message {Object} Parsed XVIZ message
   * @params bufferUpdated {Boolean} True if streamBuffer has changed
   */
  _onXVIZTimeslice(message, bufferUpdated) {}

  // PRIVATE Methods

  // Notifications and metric reporting
  _onWSOpen = () => {
    // Request data if we are restarting, otherwise wait for metadata
    // TODO - protocol negotiation
    this.xvizHandler = new XVIZController(this.socket);

    this._debug('socket_open', this.requestParams);
    this._onOpen();
  };

  // Handle dispatching events, triggering probes, and delegating to the XVIZ handler
  /* eslint-disable complexity */
  _onWSMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        if (this.get('metadata')) {
          // already has metadata
          return;
        }

        this.set('logSynchronizer', new StreamSynchronizer(this.streamBuffer));
        this._setMetadata(message);
        this.emit('ready', message);
        break;

      case LOG_STREAM_MESSAGE.TIMESLICE:
        const oldVersion = this.streamBuffer.valueOf();
        this.streamBuffer.insert(message);

        const bufferUpdated = this.streamBuffer.valueOf() !== oldVersion;
        if (bufferUpdated) {
          this.set('streams', this.streamBuffer.getStreams());
        }

        this._onXVIZTimeslice(message, bufferUpdated);

        this.emit('update', message);
        break;

      case LOG_STREAM_MESSAGE.DONE:
        this.emit('finish', message);
        break;

      default:
        this.emit('error', message);
    }
  };
  /* eslint-enable complexity */

  _onWSError = error => {
    this.emit('error', error);
  };

  _onWSClose = event => {
    // Only called on connection closure, which would be an error case
    this._debug('socket_closed', event);
  };
}
