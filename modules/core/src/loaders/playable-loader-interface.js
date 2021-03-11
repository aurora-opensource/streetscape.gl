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

import LoaderInterface from './loader-interface';

/**
 * This interfaces exposes the methods required for compatibility with
 * the PlaybackControl component - that enables scrubbing through a buffered log.
 */
export default class PlayableLoaderInterface extends LoaderInterface {
  /**
   * Seek to a given timestamp.
   *
   * @param {Number} timestamp
   */
  seek(timestamp) {
    throw new Error('Not implemented');
  }

  /**
   * Whether the loader is loading data.
   *
   * @returns {Boolean} isOpen
   */
  isOpen() {
    return false;
  }

  /**
   * Called to start loading data.
   */
  connect() {
    throw new Error('not implemented');
  }

  /**
   * Called to stop loading data.
   */
  close() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the current timestamp in seconds.
   *
   * @returns {Number} current time.
   */
  getCurrentTime = () => this.get('timestamp');

  /**
   * Returns the current look ahead offset in seconds.
   *
   * @returns {Number} look ahead.
   */
  getLookAhead = () => this.get('lookAhead');

  /**
   * Set the look ahead offset in seconds.
   * This is used to retrieve a slice from the future states for display.
   *
   * @param {Number} lookAhead - look ahead in seconds.
   */
  setLookAhead(lookAhead) {
    this.set('lookAhead', lookAhead);
  }

  /**
   * Returns the start timestamp of the log.
   *
   * @returns {Number} start timestamp.
   */
  getLogStartTime() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the end timestamp of the log.
   *
   * @returns {Number} end timestamp.
   */
  getLogEndTime() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the loaded time ranges of the buffer, as an array of `[start, end]` timestamps.
   * @returns {[Number, Number]} - [start, end] timestamps.
   */
  getBufferedTimeRanges() {
    throw new Error('Not implemented');
  }
}
