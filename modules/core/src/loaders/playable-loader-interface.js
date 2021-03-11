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
   * Play the log.
   */
  play() {
    throw new Error('Not implemented');
  }

  /**
   * Pause the log.
   */
  pause() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the current timestamp in seconds.
   */
  getCurrentTime() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the current look ahead offset in seconds.
   */
  getLookAhead() {
    throw new Error('Not implemented');
  }

  /**
   * Set the look ahead offset in seconds.
   * This is used to retrieve a slice from the future states for display.
   *
   * @param {Number} lookAhead - look ahead in seconds.
   */
  setLookAhead(lookAhead) {
    throw new Error('Not implemented');
  }

  /**
   * Returns the start timestamp of the log.
   */
  getLogStartTime() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the end timestamp of the log.
   */
  getLogEndTime() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the loaded time ranges of the buffer, as an array of `[start, end]` timestamps.
   */
  getBufferedTimeRanges() {
    throw new Error('Not implemented');
  }
}
