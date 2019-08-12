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
import {getXVIZConfig} from '@xviz/parser';

import XVIZWebsocketLoader from './xviz-websocket-loader';
import * as rangeUtils from '../utils/buffer-range';

const DEFAULT_LOG_PROFILE = 'default';
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_BUFFER_LENGTH = {
  seconds: 60,
  milliseconds: 60000
};

/* eslint-disable no-unused-vars */
function getSocketRequestParams(options) {
  const {
    logGuid,
    logProfile = DEFAULT_LOG_PROFILE,
    duration: requestedDuration,
    timestamp,
    serverConfig,
    bufferLength = DEFAULT_BUFFER_LENGTH[getXVIZConfig().TIMESTAMP_FORMAT],
    // These are parent class options we want to filter
    maxConcurrency,
    WebSocketClass,
    ...passThroughOptions
  } = options;

  // set duration overrides & defaults
  const duration = requestedDuration || serverConfig.defaultLogLength;

  assert(logGuid && duration);

  const queryParams = {
    ...passThroughOptions,
    ...serverConfig.queryParams,
    log: logGuid,
    profile: logProfile
  };

  if (duration) {
    queryParams.duration = duration;
  }
  if (timestamp) {
    queryParams.timestamp = timestamp;
  }

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
/* eslint-enable no-unused-vars */

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

export default class XVIZStreamLoader extends XVIZWebsocketLoader {
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

    // Construct websocket connection details from parameters
    this.requestParams = getSocketRequestParams(options);
    assert(this.requestParams.bufferLength, 'bufferLength must be provided');

    this.retrySettings = {
      retries: this.requestParams.retryAttempts,
      minTimeout: 500,
      randomize: true
    };

    // Reconnection state
    this.lastRequest = null;
    this.bufferRange = rangeUtils.empty();
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
    this.streamBuffer.updateFixedBuffer(params.bufferStart, params.bufferEnd);
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

  /* Hook overrides */
  _onOpen = () => {
    if (this.lastRequest) {
      this.xvizHandler.transformLog(this.lastRequest);
    }
  };

  _getBufferedTimeRanges() {
    return this.bufferRange;
  }

  _getBufferStartTime() {
    return this.lastRequest && this.lastRequest.bufferStart;
  }

  _getBufferEndTime() {
    return this.lastRequest && this.lastRequest.bufferEnd;
  }

  _onXVIZTimeslice(message) {
    const bufferUpdated = super._onXVIZTimeslice(message);
    if (bufferUpdated) {
      this.bufferRange = rangeUtils.add(
        [this.lastRequest.startTimestamp, message.timestamp],
        this.bufferRange
      );
    }
  }
}
