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

import assert from 'assert';
import {requestBinary, requestJson} from '../utils/request-utils';
import {
  parseStreamMessage,
  LOG_STREAM_MESSAGE,
  XvizStreamBuffer,
  parseBinaryXVIZ,
  StreamSynchronizer
} from '@xviz/client';

import XVIZLoaderInterface from './xviz-loader-interface';

const DEFAULT_LOG_PROFILE = 'default';

function getParams(options) {
  const {logGuid, logProfile = DEFAULT_LOG_PROFILE, fileFormat, timestamp, serverConfig} = options;

  // set duration overrides & defaults
  const duration = options.duration || serverConfig.defaultLogLength;

  assert(logGuid && duration);
  assert(fileFormat);

  return {
    fileFormat,
    dataPath: serverConfig.dataPath,
    logGuid,
    logProfile,
    duration,
    timestamp,
    serverConfig
  };
}

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.getFilePath);
    this._getFilePath = options.getFilePath;

    this.requestParams = getParams(options);
    this.streamBuffer = new XvizStreamBuffer();
    this.logSynchronizer = null;
    this.metadata = null;
  }

  isOpen() {
    return true;
  }

  connect() {
    // verify the dataPath exists?
    this._getFile();
  }

  close() {
    // what should do here?
  }

  getBufferRange() {
    return this.streamBuffer.getLoadedTimeRange();
  }

  seek(timestamp) {
    this.timestamp = timestamp;

    if (!timestamp) {
      return;
    }

    const {timestamp: currentTimestamp, duration: currentDuration} = this.requestParams;

    if (timestamp >= currentTimestamp && timestamp < currentTimestamp + currentDuration) {
      // within range
      return;
    }

    this.requestParams = getParams({
      ...this.requestParams,
      fileFormat: this.fileFormat,
      timestamp
    });

    this._getFile();
  }

  _getFile() {
    const params = this.requestParams;
    const {timestamp} = params;
    const filePath = this._getFilePath(timestamp);
    const fileFormat = this.fileFormat || 'binary';

    switch (fileFormat) {
      case 'binary':
        requestBinary(filePath).then(data => {
          parseStreamMessage({
            message: parseBinaryXVIZ(data),
            onResult: this._onMessage,
            onError: this._onError,
            worker: params.serverConfig.worker,
            maxConcurrency: params.serverConfig.maxConcurrency
          });
        });
        break;
      case 'json':
        requestJson(filePath).then(data =>
          parseStreamMessage({
            message: data,
            onResult: this._onMessage,
            onError: this._onError,
            worker: params.serverConfig.worker,
            maxConcurrency: params.serverConfig.maxConcurrency
          })
        );
        break;
      default:
    }
  }

  _onMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.logSynchronizer = new StreamSynchronizer(message.start_time, this.streamBuffer);
        this.metadata = message;
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

  _onError = error => {
    this.emit('error', error);
  };
}
