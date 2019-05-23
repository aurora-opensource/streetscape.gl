// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable camelcase */
import assert from 'assert';
import {XVIZStreamBuffer} from '@xviz/parser';

import XVIZWebsocketLoader from './xviz-websocket-loader';

const DEFAULT_LOG_PROFILE = 'default';
const DEFAULT_RETRY_ATTEMPTS = 3;

/* eslint-disable no-unused-vars */
function getSocketRequestParams(options) {
  const {
    logProfile = DEFAULT_LOG_PROFILE,
    serverConfig,
    bufferLength = 30,
    // These are parent class options we want to filter
    maxConcurrency,
    WebSocketClass,
    ...passThroughOptions
  } = options;

  const queryParams = {
    ...passThroughOptions,
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
/* eslint-enable no-unused-vars */

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

  seek(timestamp) {
    super.seek(timestamp);

    // Info the streamBuffer so it can prune appropriately
    this.streamBuffer.setCurrentTime(timestamp);
  }

  /* Hook overrides */

  _onOpen = () => {};

  _getBufferStartTime() {
    return this.streamBuffer.getBufferRange().start;
  }

  _getBufferEndTime() {
    return this.streamBuffer.getBufferRange().end;
  }

  _onXVIZTimeslice(message) {
    super._onXVIZTimeslice(message);
    // Live loader always shows latest data
    this.seek(message.timestamp);
  }
}
