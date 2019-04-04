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

import {parseStreamMessage, XVIZStreamBuffer} from '@xviz/parser';

import {_XVIZLoaderInterface as XVIZLoaderInterface} from 'streetscape.gl';

export default class XVIZJsonLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);
    this.streamBuffer = new XVIZStreamBuffer();
    this.state.timestamps = [];
    this._history = new Map();
  }

  push(message) {
    this._rawMessage = message;
    parseStreamMessage({
      message,
      onResult: this.onXVIZMessage,
      onError: this.onError
    });
  }

  /* Custom data selector */
  getTimestamps = () => this.get('timestamps');

  getFrame = key => {
    return this._history.get(key);
  };

  /* Override hooks */
  _onXVIZMetadata(message) {
    super._onXVIZMetadata(message);
    this._history.set('metadata', this._rawMessage);
  }

  _onXVIZTimeslice(message) {
    super._onXVIZTimeslice(message);
    this._history.set(message.timestamp, this._rawMessage);
    const timestamps = Array.from(this._history.keys())
      .filter(Number.isFinite)
      .sort();
    this.set('timestamps', timestamps);
    this.seek(message.timestamp);
  }

  _getLogStartTime(metadata) {
    return metadata && metadata.start_time;
  }
}
