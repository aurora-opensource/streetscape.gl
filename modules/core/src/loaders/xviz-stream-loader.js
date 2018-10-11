/* global WebSocket,ArrayBuffer */
/* eslint-disable camelcase */
import assert from 'assert';
import {
  parseStreamMessage,
  getXvizSettings,
  LOG_STREAM_MESSAGE,
  XvizStreamBuffer,
  StreamSynchronizer
} from '@xviz/parser';
import PromiseRetry from 'promise-retry';

import XVIZLoaderInterface from './xviz-loader-interface';
import {XVIZControllerV1} from './xviz-controller-v1';

const DEFAULT_LOG_PROFILE = 'default';
const DEFAULT_RETRY_ATTEMPTS = 3;

function getSocketRequestParams(options) {
  const {
    logGuid,
    logProfile = DEFAULT_LOG_PROFILE,
    timestamp,
    serverConfig,
    bufferLength = null
  } = options;

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
    bufferLength,
    retryAttempts,
    serverConfig
  };
}

/* eslint-disable complexity */
// Determine timestamp & duration to reconnect after an interrupted connection.
// Calculate based on current XVIZStreamBuffer data
function updateSocketRequestParams(timestamp, initalRequestParams, streamBuffer) {
  const {duration: totalDuration, timestamp: initialTimestamp, bufferLength} = initalRequestParams;
  const chunkSize = bufferLength
    ? Math.min(totalDuration, bufferLength + getXvizSettings().TIME_WINDOW)
    : totalDuration;

  if (!Number.isFinite(timestamp) && !Number.isFinite(initialTimestamp)) {
    return {
      ...initalRequestParams,
      duration: chunkSize,
      chunkSize
    };
  }

  const loadedRange = streamBuffer.getLoadedTimeRange();
  let start = Number.isFinite(timestamp) ? timestamp : initialTimestamp;
  let end = start + chunkSize;

  if (loadedRange) {
    if (loadedRange.start <= start && loadedRange.end >= end) {
      // ls -- s -- e --le
      // new range falls inside loaded range
      end = start;
    } else if (loadedRange.start < end && loadedRange.end >= end) {
      // s -- ls -- e --le
      // end falls inside loaded range
      end = loadedRange.start;
    } else if (loadedRange.end > start && loadedRange.start <= start) {
      // ls -- s --le -- e
      // start falls inside loaded range
      start = loadedRange.end;
    }
  }
  if (totalDuration && initialTimestamp) {
    start = Math.max(start, initialTimestamp);
    end = Math.min(end, initialTimestamp + totalDuration);
  }
  return {
    ...initalRequestParams,
    timestamp: start,
    duration: Math.max(0, end - start),
    chunkSize
  };
}
/* eslint-enable complexity */

// WebSocket constants used since WebSocket is not defined on Node
// const WEB_SOCKET_OPEN_STATE = 1;

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
   * @params bufferLength {number, optional}
   */
  constructor(options = {}) {
    super(options);

    this.socket = null;

    // Construct websocket connection details from parameters
    this.requestParams = getSocketRequestParams(options);
    this.lastRequest = null;
    this.retrySettings = {
      retries: this.requestParams.retryAttempts,
      minTimeout: 500,
      randomize: true
    };

    // Handler object for the websocket events
    // Note: needs to be last due to member dependencies
    this.WebSocketClass = options.WebSocketClass || WebSocket;

    const {bufferLength, duration} = this.requestParams;
    if (bufferLength && bufferLength < duration) {
      // bufferLength is used as the chunk size for each request
      // max buffer length is actually bufferLength * 2
      // This is so that the moving buffer always covers the current chunk
      this.streamBuffer = new XvizStreamBuffer({
        startOffset: -bufferLength,
        endOffset: bufferLength
      });
    } else {
      this.streamBuffer = new XvizStreamBuffer();
    }
  }

  isOpen() {
    return this.socket; // && this.socket.readyState === WEB_SOCKET_OPEN_STATE;
  }

  getBufferRange() {
    return this.streamBuffer.getLoadedTimeRange();
  }

  seek(timestamp) {
    super.seek(timestamp);

    // use clamped/rounded timestamp
    timestamp = this.getCurrentTime();
    const bufferStartTime = timestamp - getXvizSettings().TIME_WINDOW;

    // prune buffer
    const oldVersion = this.streamBuffer.valueOf();
    this.streamBuffer.setCurrentTime(timestamp);
    if (this.streamBuffer.valueOf() !== oldVersion) {
      this.set('streams', this.streamBuffer.getStreams());
    }

    const {timestamp: lastRequestedTimestamp, chunkSize} = this.lastRequest;

    if (
      bufferStartTime >= lastRequestedTimestamp &&
      timestamp <= lastRequestedTimestamp + chunkSize
    ) {
      // within range
      return;
    }

    // TODO - get from options
    const cancelPrevious = false;

    const params = updateSocketRequestParams(
      bufferStartTime,
      this.requestParams,
      this.streamBuffer
    );
    if (!params.duration) {
      return;
    }

    this.lastRequest = {...params, timestamp: bufferStartTime};

    if (this.isOpen() && !cancelPrevious) {
      this.xvizHandler.play(params);
    } else {
      this.close();
      this.connect(params);
    }
  }

  /**
   * Open an XVIZ socket connection with automatic retry
   *
   * @params {Object} xvizStreamParams - XVIZ log params and options
   * @returns {Promise} WebSocket connection
   */
  connect(params) {
    assert(this.socket === null, 'Socket Manager still connected');

    this._debug('stream_start');

    // Wrap retry logic around connection
    return PromiseRetry(retry => {
      // Continue from where we disconnected
      params =
        params ||
        updateSocketRequestParams(this.getCurrentTime(), this.requestParams, this.streamBuffer);
      this.lastRequest = params;

      return new Promise((resolve, reject) => {
        try {
          const ws = new this.WebSocketClass(params.url);
          ws.binaryType = 'arraybuffer';

          ws.onmessage = message => {
            return parseStreamMessage({
              message: message.data,
              onResult: this._onWSMessage,
              onError: this._onWSError,
              debug: this._debug.bind('parse_message'),
              worker: params.serverConfig.worker,
              maxConcurrency: params.serverConfig.maxConcurrency
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
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
        if (this.get('metadata')) {
          // already has metadata
          return;
        }
        this.set('logSynchronizer', new StreamSynchronizer(message.start_time, this.streamBuffer));
        Object.assign(this.lastRequest, {timestamp: message.start_time});
        this._setMetadata(message);
        this.emit('ready', message);
        break;

      case LOG_STREAM_MESSAGE.TIMESLICE:
        const oldVersion = this.streamBuffer.valueOf();
        this.streamBuffer.insert(message);
        if (this.streamBuffer.valueOf() !== oldVersion) {
          this.set('streams', this.streamBuffer.getStreams());
        }
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
