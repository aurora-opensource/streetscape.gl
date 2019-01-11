/* eslint-disable camelcase */
import assert from 'assert';
import {XVIZStreamBuffer} from '@xviz/parser';

import XVIZWebsocketLoader from './xviz-websocket-loader';

const DEFAULT_LOG_PROFILE = 'default';
const DEFAULT_RETRY_ATTEMPTS = 3;

function getSocketRequestParams(options) {
  const {logProfile = DEFAULT_LOG_PROFILE, serverConfig, bufferLength = 30} = options;

  const queryParams = {
    ...serverConfig.queryParams,
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
    logProfile,
    bufferLength,
    retryAttempts,
    serverConfig
  };
}

/*
 * Handle connecting to XVIZ socket and negotiation of the XVIZ protocol version
 *
 * This loader is used when connecting to a "live" XVIZ websocket.
 * This implies that the metadata does not have a start or end time
 * and that we want to display the latest message as soon as it arrives.
 */
export default class XVIZLiveLoader extends XVIZWebsocketLoader {
  /**
   * constructor
   * @params serverConfig {object}
   *   - serverConfig.serverUrl {string}
   *   - serverConfig.defaultLogLength {number, optional} - default 30
   *   - serverConfig.queryParams {object, optional}
   *   - serverConfig.retryAttempts {number, optional} - default 3
   * @params worker {string|function, optional}
   * @params maxConcurrency {number, optional} - default 3
   * @params logProfile {string, optional}
   * @params bufferLength {number, optional}
   */
  constructor(options = {}) {
    super(options);

    // Construct websocket connection details from parameters
    this.requestParams = getSocketRequestParams(options);
    assert(this.requestParams.bufferLength, 'bufferLength must be provided');

    this.retrySettings = {
      retries: this.requestParams.retryAttempts,
      minTimeout: 500,
      randomize: true
    };

    // Setup relative stream buffer storage by splitting bufferLength 1/3 : 2/3
    const bufferChunk = this.requestParams.bufferLength / 3;

    // Replace base class object
    this.streamBuffer = new XVIZStreamBuffer({
      startOffset: -2 * bufferChunk,
      endOffset: bufferChunk
    });
  }

  getBufferRange() {
    const bufferRange = this.streamBuffer.getBufferRange();
    return [[bufferRange.start, bufferRange.end]];
  }

  getBufferStart() {
    return this.streamBuffer && this.streamBuffer.getBufferRange().start;
  }

  getBufferEnd() {
    return this.streamBuffer && this.streamBuffer.getBufferRange().end;
  }

  seek(timestamp) {
    super.seek(timestamp);

    // Info the streamBuffer so it can prune appropriately
    this.streamBuffer.setCurrentTime(timestamp);
  }

  _onOpen = () => {};

  _onXVIZTimeslice = (message, bufferUpdated) => {
    // Live loader always shows latest data
    this.seek(message.timestamp);
  };
}
