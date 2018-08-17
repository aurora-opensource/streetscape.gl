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
import { json, buffer } from 'd3-fetch';
import {
  LOG_STREAM_MESSAGE,
  parseBinaryXVIZ,
  parseStreamMessage,
  StreamSynchronizer,
  XvizStreamBuffer
} from '@xviz/parser';

import XVIZLoaderInterface from './xviz-loader-interface';

function getParams(options) {
  const { timestamp, serverConfig } = options;

  return {
    timestamp,
    serverConfig
  };
}

const DEFUALT_BATCH_SIZE = 4;

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.getFileInfo);
    this._getFileInfo = options.getFileInfo;
    this._batchSize = options.batchSize || DEFUALT_BATCH_SIZE;

    this.requestParams = getParams(options);
    this.streamBuffer = new XvizStreamBuffer();
    this.logSynchronizer = null;
    this.metadata = null;
    this._isOpen = false;
  }

  isOpen() {
    return this._isOpen;
  }

  connect() {
    this._isOpen = true;
    this._loadNextBatch(0);
  }

  close() {
    // Stop file loading
    this._isOpen = false;
  }

  getBufferRange() {
    return this.streamBuffer.getLoadedTimeRange();
  }

  seek(timestamp) {
    this.timestamp = timestamp;
    // TODO incomplete
  }

  _loadNextBatch(startFrame) {
    if (!this.isOpen()) {
      return;
    }

    const promises = [];
    let isLastFrame = false;

    for (let i = 0; i < this._batchSize && !isLastFrame; i++) {
      const fileInfo = this._getFileInfo(startFrame + i);
      // if there is more file to load
      if (!fileInfo) {
        isLastFrame = true;
      } else {
        promises.push(this._loadFile(fileInfo));
      }
    }

    if (isLastFrame) {
      return;
    }

    // if there are more frames need to fetch
    if (promises.length > 0) {
      Promise
        .all(promises.filter(Boolean))
        .then(() => {
          this._loadNextBatch(startFrame + this._batchSize);
        });
    }
  }

  _loadFile({ filePath, fileFormat }) {
    const params = this.requestParams;
    switch (fileFormat) {
      case 'glb':
        return buffer(filePath)
          .then(data => {
            parseStreamMessage({
              message: parseBinaryXVIZ(data),
              onResult: this._onMessage,
              onError: this._onError,
              worker: params.serverConfig.worker,
              maxConcurrency: params.serverConfig.maxConcurrency
            });
          })
          .catch(error => {
            this.emit('error', error);
          });

      case 'json':
        return json(filePath).then(data => {
          parseStreamMessage({
            message: data,
            onResult: this._onMessage,
            onError: this._onError,
            worker: params.serverConfig.worker,
            maxConcurrency: params.serverConfig.maxConcurrency
          }).catch(error => {
            this.emit('error', error);
          });
        });

      default:
        this.emit('error', 'Invalid file format.');
        return null;
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
