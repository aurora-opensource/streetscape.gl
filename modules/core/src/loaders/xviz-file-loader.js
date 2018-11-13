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
import {json, buffer} from 'd3-fetch';
import {
  LOG_STREAM_MESSAGE,
  parseStreamMessage,
  StreamSynchronizer,
  XVIZStreamBuffer
} from '@xviz/parser';

import XVIZLoaderInterface from './xviz-loader-interface';

const DEFUALT_BATCH_SIZE = 4;

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.numberOfFrames && options.getFilePath);

    this._numberOfFrames = options.numberOfFrames;
    this._getFilePath = options.getFilePath;
    this._batchSize = options.maxConcurrency || DEFUALT_BATCH_SIZE;

    this.streamBuffer = new XVIZStreamBuffer();
    this._isOpen = false;
  }

  isOpen() {
    return this._isOpen;
  }

  connect() {
    this._isOpen = true;
    this._loadMetadata().then(() => this._loadNextBatch(1));
  }

  close() {
    // Stop file loading
    this._isOpen = false;
  }

  getBufferRange() {
    const range = this.streamBuffer.getLoadedTimeRange();
    if (range) {
      return [[range.start, range.end]];
    }
    return [];
  }

  seek(timestamp) {
    // TODO incomplete
    super.seek(timestamp);
  }

  _loadMetadata() {
    const metadataPath = this._getFilePath(0);
    assert(metadataPath);
    return this._loadFile(metadataPath, {worker: false});
  }

  _loadNextBatch(startFrame) {
    if (!this.isOpen()) {
      return;
    }

    if (startFrame >= this._numberOfFrames) {
      return;
    }

    const promises = [];
    for (let i = 0; i < this._batchSize && startFrame + i < this._numberOfFrames; i++) {
      const filePath = this._getFilePath(startFrame + i);
      assert(filePath);
      promises.push(this._loadFile(filePath, this.options));
    }

    // if there are more frames need to fetch
    Promise.all(promises.filter(Boolean)).then(() => {
      this._loadNextBatch(startFrame + this._batchSize);
    });
  }

  _loadFile(filePath, options) {
    const fileFormat = filePath.toLowerCase().match(/[^\.]*$/)[0];

    let fetch;
    switch (fileFormat) {
      case 'glb':
        fetch = buffer(filePath);
        break;

      case 'json':
        fetch = json(filePath);
        break;

      default:
        return Promise.reject('Unknown file format');
    }

    return fetch.then(data =>
      parseStreamMessage({
        message: data,
        onResult: this._onMessage,
        onError: this._onError,
        worker: options.worker,
        maxConcurrency: options.maxConcurrency
      })
    );
  }

  _onMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.set('logSynchronizer', new StreamSynchronizer(message.start_time, this.streamBuffer));
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

  _onError = error => {
    this.emit('error', error);
  };
}
