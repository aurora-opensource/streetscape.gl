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

/* global fetch */
import assert from 'assert';
import {parseStreamMessage, XVIZStreamBuffer} from '@xviz/parser';

import XVIZLoaderInterface from './xviz-loader-interface';

const DEFAULT_BATCH_SIZE = 4;

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.timingsFilePath && options.getFilePath);

    this._timingsFilePath = options.timingsFilePath;
    this._getFilePath = options.getFilePath;
    this._batchSize = options.maxConcurrency || DEFAULT_BATCH_SIZE;

    this.streamBuffer = new XVIZStreamBuffer();
    this._isOpen = false;

    this._lastLoadFrame = -1;
  }

  isOpen() {
    return this._isOpen;
  }

  connect() {
    this._isOpen = true;
    this._loadTimings().then(data => {
      // Adding 1 is to account for the metadata file
      this._numberOfFrames = data.timing.length + 1;
      this._loadMetadata().then(() => this._startLoad());
    });
  }

  seek(timestamp) {
    // TODO incomplete
    super.seek(timestamp);
  }

  close() {
    // Stop file loading
    this._isOpen = false;
  }

  _loadTimings() {
    return fetch(this._timingsFilePath).then(resp => resp.json());
  }

  _loadMetadata() {
    const metadataPath = this._getFilePath(0);
    assert(metadataPath);
    return this._loadFile(metadataPath, {worker: false});
  }

  _startLoad() {
    this._lastLoadFrame = 0;
    // fetching in parallel
    for (let i = 0; i < this._batchSize && i < this._numberOfFrames; i++) {
      this._loadNextFrame();
    }
  }

  _loadNextFrame() {
    if (!this.isOpen()) {
      return;
    }

    this._lastLoadFrame = this._lastLoadFrame + 1;

    if (this._lastLoadFrame >= this._numberOfFrames) {
      this.emit('done');
      return;
    }

    const filePath = this._getFilePath(this._lastLoadFrame);
    assert(filePath);
    Promise.resolve(this._loadFile(filePath, this.options)).then(() => {
      this._loadNextFrame();
    });
  }

  _loadFile(filePath, options) {
    const fileFormat = filePath.toLowerCase().match(/[^\.]*$/)[0];

    let file;
    switch (fileFormat) {
      case 'glb':
        file = fetch(filePath).then(resp => resp.arrayBuffer());
        break;

      case 'json':
        file = fetch(filePath).then(resp => resp.json());
        break;

      default:
        return Promise.reject('Unknown file format');
    }

    return file.then(data => {
      // if not open, do not parse the message
      if (this._isOpen) {
        parseStreamMessage({
          message: data,
          onResult: this.onXVIZMessage,
          onError: this.onError,
          worker: options.worker,
          maxConcurrency: options.maxConcurrency,
          debug: this._debug.bind(this, 'parse_message')
        });
      }
    });
  }
}
