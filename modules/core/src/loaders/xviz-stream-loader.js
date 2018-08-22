/* global WebSocket,ArrayBuffer */
/* eslint-disable camelcase */
import assert from 'assert';
import {
  parseStreamMessage,
  LOG_STREAM_MESSAGE,
  XvizStreamBuffer,
  parseBinaryXVIZ,
  StreamSynchronizer
} from '@xviz/parser';
import PromiseRetry from 'promise-retry';

import XVIZLoaderInterface from './xviz-loader-interface';
import {XVIZControllerV1} from './xviz-controller-v1';

const DEFAULT_LOG_PROFILE = 'default';
const DEFAULT_RETRY_ATTEMPTS = 3;

function getSocketRequestParams(options) {
  const {logGuid, logProfile = DEFAULT_LOG_PROFILE, timestamp, serverConfig} = options;

  // set duration overrides & defaults
  const duration = options.duration || serverConfig.defaultLogLength;

  assert(logGuid && duration);

  const queryParams = {
    ...serverConfig.queryParams,
    log: logGuid,
    profile: logProfile
  };
  const retryAttempts = Number.isInteger(serverConfig.retryAttempts)
    ? serverConfig.retryAttempts
    : DEFAULT_RETRY_ATTEMPTS;

  const qs = Object.keys(queryParams)
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  return {
    url: `${serverConfig.serverUrl}?${qs}`,
    logGuid,
    logProfile,
    duration,
    timestamp,
    retryAttempts,
    serverConfig
  };
}

// Determine timestamp & duration to reconnect after an interrupted connection.
// Calculate based on current XVIZStreamBuffer data
//
// TODO: This needs revisited when we randomly access data
function updateSocketRequestParams(initalRequestParams, streamBuffer) {
  const {duration: initalDuration, timestamp: initialTimestamp} = initalRequestParams;

  let timestamp = initialTimestamp;
  let duration = initalDuration;

  if (streamBuffer instanceof XvizStreamBuffer) {
    const loadedRange = streamBuffer.getLoadedTimeRange();
    if (loadedRange) {
      timestamp = loadedRange.end;
    }
    if (initalDuration && initialTimestamp) {
      duration = initialTimestamp + initalDuration - timestamp;
    }
  }

  return getSocketRequestParams({...initalRequestParams, timestamp, duration});
}

// WebSocket constants used since WebSocket is not defined on Node
const WEB_SOCKET_OPEN_STATE = 1;

/*
 * Handle connecting to XVIZ socket and negotiation of the XVIZ protocol version
 *
 * TODO: Direction is to move into the XVIZ module, but right now it has too many
 *       dependencies tied to the store.
 *
 * Open questions:
 * - specifics of protocol negotiation
 * - should auto reconnect happen at this level or the XVIZSocket
 *   - I think the management of data will greatly fluence this, so probably @ the XVIZSocket level
 * - better separate of protocol handling from XVIZ message handling
 *
 */
export default class XVIZStreamLoader extends XVIZLoaderInterface {
  /**
   * constructor
   * @params serverConfig {object}
   *   - serverConfig.serverUrl {string}
   *   - serverConfig.defaultLogLength {number, optional} - default 30
   *   - serverConfig.queryParams {object, optional}
   *   - serverConfig.retryAttempts {number, optional} - default 3
   *   - serverConfig.worker {string|function, optional}
   *   - serverConfig.maxConcurrency {number, optional} - default 3
   * @params logGuid {string}
   * @params logProfile {string, optional}
   * @params duration {number, optional}
   * @params timestamp {number, optional}
   */
  constructor(options = {}) {
    super(options);

    this.socket = null;

    // Construct websocket connection details from parameters
    this.requestParams = getSocketRequestParams(options);
    this.retrySettings = {
      retries: this.requestParams.retryAttempts,
      minTimeout: 500,
      randomize: true
    };

    // Handler object for the websocket events
    // Note: needs to be last due to member dependencies
    this.WebSocketClass = options.WebSocketClass || WebSocket;

    this.streamBuffer = new XvizStreamBuffer();
  }

  isOpen() {
    return this.socket && this.socket.readyState === WEB_SOCKET_OPEN_STATE;
  }

  getBufferRange() {
    return this.streamBuffer.getLoadedTimeRange();
  }

  seek(timestamp) {
    super.seek(timestamp);

    // use clamped timestamp
    timestamp = this.timestamp;

    const {timestamp: currentTimestamp, duration: currentDuration} = this.requestParams;

    if (timestamp >= currentTimestamp && timestamp < currentTimestamp + currentDuration) {
      // within range
      return;
    }

    // TODO - get from options
    const cancelPrevious = false;

    this.requestParams = getSocketRequestParams({
      ...this.requestParams,
      timestamp
    });

    if (this.isOpen() && !cancelPrevious) {
      this.xvizHandler.play(this.requestParams);
    } else {
      this.close();
      this.socket = null;
      this.connect();
    }
  }

  /**
   * Open an XVIZ socket connection with automatic retry
   *
   * @params {Object} xvizStreamParams - XVIZ log params and options
   * @returns {Promise} WebSocket connection
   */
  connect() {
    assert(this.socket === null, 'Socket Manager still connected');

    this._debug('stream_start');

    // Wrap retry logic around connection
    return PromiseRetry(retry => {
      // Continue from where we disconnected
      const params = updateSocketRequestParams(this.requestParams, this.streamBuffer);

      return new Promise((resolve, reject) => {
        try {
          const ws = new this.WebSocketClass(params.url);
          ws.binaryType = 'arraybuffer';

          ws.onmessage = message =>
            parseStreamMessage({
              message:
                message.data instanceof ArrayBuffer ? parseBinaryXVIZ(message.data) : message.data,
              onResult: this._onWSMessage,
              onError: this._onWSError,
              debug: this._debug.bind('parse_message'),
              worker: params.serverConfig.worker,
              maxConcurrency: params.serverConfig.maxConcurrency
            });
          ws.onerror = this._onWSError;
          ws.onclose = event => {
            this._onWSClose(event);
            reject(event);
          };

          // On success, resolve the promise with the now ready socket
          ws.onopen = () => {
            this.socket = ws;
            this._onWSOpen(params);
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
    if (this.isOpen()) {
      this.socket.close();
    }
  }

  // Notifications and metric reporting
  _onWSOpen = params => {
    // Immediately send request for data.
    // TODO - protocol negotiation
    this.xvizHandler = new XVIZControllerV1(this.socket);
    this.xvizHandler.play(params);
    this._debug('socket_open', params);
  };

  // Handle dispatching events, triggering probes, and delegating to the XVIZ handler
  _onWSMessage = message => {
    // Let the handler know and respond
    if (this.xvizHandler) {
      this.xvizHandler.onMessage(message);
    }

    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.logSynchronizer = new StreamSynchronizer(message.start_time, this.streamBuffer);
        this._setMetadata(message);
        this.emit('ready', message);
        break;

      case LOG_STREAM_MESSAGE.TIMESLICE:
        this.streamBuffer.insert(message);
        this.emit('update', message);
        break;

      case LOG_STREAM_MESSAGE.DONE:
        this.emit('finish', message);
        break;

      default:
        this.emit('error', message);
    }
  };

  _onWSError = error => {
    this.emit('error', error);
  };

  _onWSClose = event => {
    // Only called on connection closure, which would be an error case
    this._debug('socket_closed', event);
  };
}
