/* global WebSocket,ArrayBuffer */
/* eslint-disable camelcase */
import assert from 'assert';
import {
  parseStreamMessage,
  LOG_STREAM_MESSAGE,
  XVIZStreamBuffer,
  StreamSynchronizer,
  getXVIZConfig
} from '@xviz/parser';
import PromiseRetry from 'promise-retry';

import XVIZLoaderInterface from './xviz-loader-interface';
import XVIZController from './xviz-controller-v2';
import * as rangeUtils from '../utils/buffer-range';

const DEFAULT_LOG_PROFILE = 'default';
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_BUFFER_LENGTH = {
  seconds: 30,
  milliseconds: 30000
};

function getSocketRequestParams(options) {
  const {
    logGuid,
    logProfile = DEFAULT_LOG_PROFILE,
    timestamp,
    serverConfig,
    bufferLength = DEFAULT_BUFFER_LENGTH[getXVIZConfig().TIMESTAMP_FORMAT]
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

// Determine timestamp & duration to reconnect after an interrupted connection.
// Calculate based on current XVIZStreamBuffer data
// Returns null if update is not needed
export function updateSocketRequestParams(timestamp, metadata, bufferLength, bufferRange) {
  const {start_time: logStartTime = -Infinity, end_time: logEndTime = Infinity} = metadata;
  const totalDuration = logEndTime - logStartTime;
  const chunkSize = bufferLength || totalDuration;

  if (!Number.isFinite(totalDuration)) {
    // If there is no start/end time in metadata, buffer length must be supplied
    assert(bufferLength, 'bufferLength is invalid');
  }
  if (chunkSize >= totalDuration) {
    // Unlimited buffer
    return {
      startTimestamp: logStartTime,
      endTimestamp: logEndTime,
      bufferStart: logStartTime,
      bufferEnd: logEndTime
    };
  }

  const bufferStart = Math.max(timestamp - chunkSize / 2, logStartTime);
  const bufferEnd = Math.min(bufferStart + chunkSize, logEndTime);
  const newBufferRange = rangeUtils.subtract([bufferStart, bufferEnd], bufferRange);

  if (newBufferRange.length === 0) {
    return null;
  }
  const start = newBufferRange[0][0];
  const end = newBufferRange[newBufferRange.length - 1][1];

  return {
    startTimestamp: start,
    endTimestamp: end,
    bufferStart,
    bufferEnd
  };
}

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

    // Construct websocket connection details from parameters
    this.requestParams = getSocketRequestParams(options);
    this.lastRequest = null;
    this.retrySettings = {
      retries: this.requestParams.retryAttempts,
      minTimeout: 500,
      randomize: true
    };

    // Flag for when we do not have a known start time for the log
    // and will leave the time up to the server
    this.liveMode = false;

    // Handler object for the websocket events
    // Note: needs to be last due to member dependencies
    this.WebSocketClass = options.WebSocketClass || WebSocket;
    this.streamBuffer = new XVIZStreamBuffer();
    this.bufferRange = rangeUtils.empty();
  }

  isOpen() {
    return this.socket; // && this.socket.readyState === WEB_SOCKET_OPEN_STATE;
  }

  getBufferRange() {
    return this.bufferRange;
  }

  getBufferStart() {
    return this.lastRequest && this.lastRequest.bufferStart;
  }

  getBufferEnd() {
    return this.lastRequest && this.lastRequest.bufferEnd;
  }

  seek(timestamp) {
    super.seek(timestamp);

    // use clamped/rounded timestamp
    timestamp = this.getCurrentTime();

    if (this.lastRequest && this.streamBuffer.isInBufferRange(timestamp)) {
      // Already loading
      return;
    }

    const metadata = this.getMetadata();
    if (!metadata) {
      return;
    }

    const params = updateSocketRequestParams(
      timestamp,
      metadata,
      this.requestParams.bufferLength,
      this.bufferRange
    );
    if (!params) {
      return;
    }

    this.lastRequest = params;

    // prune buffer
    const oldVersion = this.streamBuffer.valueOf();
    this.streamBuffer.updateFixedBuffer(params.bufferStart, params.bufferEnd);
    if (this.streamBuffer.valueOf() !== oldVersion) {
      this.set('streams', this.streamBuffer.getStreams());
    }
    this.bufferRange = rangeUtils.intersect(
      [params.bufferStart, params.bufferEnd],
      this.bufferRange
    );

    if (this.isOpen()) {
      this.xvizHandler.transformLog(params);
    } else {
      // Wait for socket to connect
    }
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

  _enableLiveMode() {
    this.liveMode = true;
    this.xvizHandler.transformLog();
  }

  // Notifications and metric reporting
  _onWSOpen = () => {
    // Request data if we are restarting, otherwise wait for metadata
    // TODO - protocol negotiation
    this.xvizHandler = new XVIZController(this.socket);

    this._debug('socket_open', this.requestParams);

    if (this.lastRequest) {
      this.xvizHandler.transformLog(this.lastRequest);
    }
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

        if (!this.getCurrentTime()) {
          // We enable liveMode if _setMetadata() did not set the timestamp
          this._enableLiveMode();
        }

        break;

      case LOG_STREAM_MESSAGE.TIMESLICE:
        const oldVersion = this.streamBuffer.valueOf();
        this.streamBuffer.insert(message);

        // Setup the lastRequest since it was not set in seek() due to the live mode
        if (this.liveMode && !this.lastRequest) {
          const bufferLength =
            this.options.bufferLength || DEFAULT_BUFFER_LENGTH[getXVIZConfig().TIMESTAMP_FORMAT];
          this.lastRequest = {
            startTimestamp: message.timestamp,
            endTime: message.timestamp + bufferLength,
            bufferStart: message.timestamp,
            bufferEnd: message.timestamp + bufferLength
          };
        }

        if (this.streamBuffer.valueOf() !== oldVersion) {
          this.set('streams', this.streamBuffer.getStreams());
          this.bufferRange = rangeUtils.add(
            [this.lastRequest.startTimestamp, message.timestamp],
            this.bufferRange
          );
        }

        // Fire initial seek to set timestamp so rendering starts
        if (this.liveMode && !this.getCurrentTime()) {
          this.seek(message.timestamp);
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
  /* eslint-enable complexity */

  _onWSError = error => {
    this.emit('error', error);
  };

  _onWSClose = event => {
    // Only called on connection closure, which would be an error case
    this._debug('socket_closed', event);
  };
}
