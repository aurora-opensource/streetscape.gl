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

import {
  LOG_STREAM_MESSAGE,
  parseStreamMessage,
  StreamSynchronizer,
  XVIZStreamBuffer
} from '@xviz/parser';

import {_XVIZLoaderInterface as XVIZLoaderInterface} from 'streetscape.gl';

export default class XVIZJsonLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);
    this.streamBuffer = new XVIZStreamBuffer();
  }

  getBufferRange() {
    const range = this.streamBuffer.getLoadedTimeRange();
    if (range) {
      return [[range.start, range.end]];
    }
    return [];
  }

  push(message) {
    console.log(message); // eslint-disable-line

    parseStreamMessage({
      message,
      onResult: this._onMessage,
      onError: this._onError
    });
  }

  _onMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.set('logSynchronizer', new StreamSynchronizer(this.streamBuffer));
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

      default:
        this.emit('error', message);
    }
  };

  _onError = error => {
    this.emit('error', error);
  };
}
