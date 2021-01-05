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

/* global fetch, ReadableStream, console */
/* eslint-disable consistent-return, no-console, no-unused-vars, no-undef */
const COMMS_CACHE_HEADER_VERSION = 0x033b0002;
const MESSAGE_HEADER = 8;
/* SCC Binary Layout
 * [----] 4 magic
 * [----] 4 size of header
 * [*]    header
 * messages
 *
 * Message Binary Layout
 * [----] 4 size
 * [----] 4 timestamp_ms
 * [*]      data
 */

class SCCMessage {
  constructor(array, view, start, limit) {
    this.array = array;
    this.view = view;
    this.start = start;
    this.limit = limit;
    this.mark = start;

    this._size = undefined;
    this._timestamp = undefined;
  }

  _sizeCheck(nBytes) {
    return this.mark + nBytes < this.limit;
  }

  setLimit(end) {
    this.limit = end;
  }

  data() {
    return this.array.slice(this.mark + MESSAGE_HEADER, this._endOffset);
  }

  get size() {
    if (this._size === undefined && this._sizeCheck(4)) {
      this._size = this.view.getUint32(this.mark, true);
    }

    return this._size;
  }

  get _endOffset() {
    if (this.size) {
      return this.mark + MESSAGE_HEADER + this.size;
    }
    return undefined;
  }

  get timestamp() {
    if (this._timestamp === undefined && this._sizeCheck(4 + 4)) {
      this._timestamp = this.view.getUint32(this.mark + 4, true);
    }

    return this._timestamp;
  }

  available() {
    if (this._endOffset) {
      return this._endOffset < this.limit;
    }

    return false;
  }

  next() {
    if (this.available()) {
      this.mark = this._endOffset;

      this._size = undefined;
      this._timestamp = undefined;
      return true;
    }
    return false;
  }
}

export class SCCLog {
  constructor(onMessage) {
    this.array = null; // for slicing data
    this.buffer = null; // for appending data
    this.view = null; // for reading data
    this.limit = 0;

    this.mark = 0;
    this.onMessage = onMessage;
  }

  open(url) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          this.console.log(response.statusText);
          return;
        }

        const reader = response.body.getReader();
        const self = this;
        return new ReadableStream({
          start() {
            return pump();

            function pump() {
              reader.read().then(({done, value}) => {
                if (!done) {
                  self._addChunk(response, value);
                  return pump();
                }
              });
            }
          }
        });
      })
      .catch(error => {
        console.log(`Error fetching log: ${error}`);
      });
  }

  _addChunk(response, data) {
    if (this.limit === 0) {
      const length = response.headers.get('content-length');

      this.array = new ArrayBuffer(length);

      this.buffer = new Uint8Array(this.array);
      this.buffer.set(data, 0);
      this.limit = data.length;

      this.view = new DataView(this.array);
    } else {
      this.buffer.set(data, this.limit);
      this.limit += data.length;
    }

    this.publishMessages();
  }

  publishMessages() {
    if (!this.message) {
      const startOffset = this._readHeader();
      if (startOffset) {
        this.message = new SCCMessage(this.array, this.view, startOffset, this.limit);
      } else {
        return;
      }
    } else {
      this.message.setLimit(this.limit);
    }

    while (this.message.available()) {
      this.onMessage(this.message.data(), this.message.timestamp);
      this.message.next();
    }
  }

  _readHeader() {
    const magic = this.view.getUint32(0, true);
    if (magic !== COMMS_CACHE_HEADER_VERSION) {
      throw new Error('File does not start with the expected signature.');
    }

    const headerSize = this.view.getUint32(4, true);
    if (headerSize + 8 > this.limit) {
      throw new Error('Header is larger than file');
    }

    return headerSize + 8;
  }
}
