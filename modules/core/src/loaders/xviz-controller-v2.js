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

/* XVIZ Controller
 *
 * XVIZController should present a uniform base object interface (as much as possible)
 * such that application logic doesn't need to know the difference between the protocols.
 *
 * Intention is to add bi-directional protocol concepts:
 *  - stop
 *  - seek
 *  - pause
 *  ...
 */

/* XVIZControllerV1
 *
 * XVIZ v1 handler that opens the log on connetion and closes when 'done' is received.
 */
export default class XVIZControllerV2 {
  constructor(socket) {
    assert(socket, 'XVIZ socket');
    this.socket = socket;
    this.transformCounter = 0;
  }

  _send(type, message) {
    // TODO(twojtasz): change to @xviz/io
    const msg = {type: `xviz/${type}`, data: message};
    this.socket.send(JSON.stringify(msg));
  }

  transformLog({startTimestamp, endTimestamp} = {}) {
    const msg = {};
    if (startTimestamp) {
      msg.start_timestamp = startTimestamp; // eslint-disable-line camelcase
    }

    if (endTimestamp) {
      msg.end_timestamp = endTimestamp; // eslint-disable-line camelcase
    }

    // Add in a sequential id
    msg.id = `${this.transformCounter}`;
    this.transformCounter++;

    this._send('transform_log', msg);
  }
}
