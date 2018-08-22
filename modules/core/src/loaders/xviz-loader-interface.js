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

import {getXvizSettings} from '@xviz/parser';
import {clamp} from 'math.gl';

/* eslint-disable callback-return */
export default class XVIZLoaderInterface {
  constructor(options = {}) {
    this.options = options;
    this._debug = options.debug || (() => {});
    this.callbacks = {};

    // private
    this.logSynchronizer = null;
    this.timestamp = null;
    this.metadata = null;
  }

  /* Event types:
   * - ready
   * - update
   * - finish
   * - error
   */
  on(eventType, cb) {
    this.callbacks[eventType] = this.callbacks[eventType] || [];
    this.callbacks[eventType].push(cb);
    return this;
  }

  off(eventType, cb) {
    const callbacks = this.callbacks[eventType];
    if (callbacks) {
      const index = callbacks.indexOf(cb);
      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    }
    return this;
  }

  emit(eventType, eventArgs) {
    const callbacks = this.callbacks[eventType];
    if (callbacks) {
      for (const cb of callbacks) {
        cb(eventType, eventArgs);
      }
    }
  }

  /* Connection API */
  isOpen() {
    return false;
  }

  connect() {
    throw new Error('not implemented');
  }

  seek(timestamp) {
    const {metadata} = this;

    if (metadata) {
      const startTime = this.getLogStartTime();
      const endTime = this.getLogEndTime();
      timestamp = clamp(timestamp, startTime, endTime);
    }

    this.timestamp = timestamp;
    this.emit('update');
  }

  close() {
    throw new Error('not implemented');
  }

  /* Data selector API */

  getCurrentTime() {
    return this.timestamp;
  }

  getMetadata() {
    return this.metadata;
  }

  getLogStartTime() {
    const timeWindow = getXvizSettings().TIME_WINDOW;
    return this.metadata && this.metadata.start_time + timeWindow;
  }

  getLogEndTime() {
    return this.metadata && this.metadata.end_time;
  }

  getBufferRange() {
    throw new Error('not implemented');
  }

  getCurrentFrame() {
    const {logSynchronizer, metadata, timestamp} = this;

    if (logSynchronizer && metadata && Number.isFinite(timestamp)) {
      logSynchronizer.setTime(timestamp);
      return logSynchronizer.getCurrentFrame(metadata.streams);
    }
    return null;
  }

  /* Private actions */
  _setMetadata(metadata) {
    this.metadata = metadata;
    const newTimestamp = Number.isFinite(this.timestamp) ? this.timestamp : metadata.start_time;
    this.seek(newTimestamp);
  }
}
