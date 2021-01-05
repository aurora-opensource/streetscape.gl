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

/* global console */
/* eslint-disable consistent-return, camelcase, no-console, no-unused-vars, no-undef */
import assert from 'assert';
import {parseStreamMessage} from '@xviz/parser';
import {XVIZ_PROTOBUF_MESSAGE} from '@xviz/io';

import {XVIZStreamLoader} from 'streetscape.gl';

const XVIZ_PROTOBUF_MAGIC = Uint8Array.from([0x50, 0x42, 0x45, 0x31]);

export class StudioLoader extends XVIZStreamLoader {
  constructor(options = {}) {
    super(options);
    this.lastRequest = {startTimestamp: 0};
    this.counter = 0;
  }

  handleStudioMsg(arrayBuffer) {
    const strippedBuffer = new Uint8Array(arrayBuffer, 4);
    const envelope = XVIZ_PROTOBUF_MESSAGE.Envelope.decode(strippedBuffer);
    const xviz = {
      type: envelope.type.substring(envelope.type.lastIndexOf('/') + 1),
      data: null
    };

    let state = null;

    switch (envelope.type) {
      /*
      case '/xviz/metadata':
        const tmpMeta = XVIZ_PROTOBUF_MESSAGE.Metadata.decode(envelope.data.value);
        xviz.data = postProcessProtobuf(tmpMeta);
        postProcessUIConfig(xviz.data);
        break;
        */
      case '/xviz/stream_set':
        const tmpSet = XVIZ_PROTOBUF_MESSAGE.StreamSet.decode(envelope.data.value);

        const update = {
          update_type: XVIZ_PROTOBUF_MESSAGE.StateUpdate.UpdateType.INCREMENTAL,
          updates: [tmpSet]
        };

        const errMsg = XVIZ_PROTOBUF_MESSAGE.StateUpdate.verify(update);
        if (errMsg) {
          console.log(errMsg);
        }

        state = XVIZ_PROTOBUF_MESSAGE.StateUpdate.encode(update).finish();
        break;
      default:
        break;
      // throw new Error(`Unknown Message type ${envelope.type}`);
    }

    if (state) {
      const env = {
        type: 'xviz/state_update',
        data: {type_url: 'xviz.v2.StateUpdate', value: state}
      };
      const msg = XVIZ_PROTOBUF_MESSAGE.Envelope.encode(env).finish();
      const buffer = new Uint8Array(msg.byteLength + 4);
      buffer.set(XVIZ_PROTOBUF_MAGIC, 0);
      buffer.set(msg, 4);
      return buffer.buffer;
    }

    return undefined;
  }

  connect() {
    assert(this.socket === null, 'Socket Manager still connected');

    this._debug('stream_start');
    const {url} = this.requestParams;

    // Wrap retry logic around connection
    return new Promise((resolve, reject) => {
      try {
        const ws = new this.WebSocketClass(url);
        ws.binaryType = 'arraybuffer';

        ws.onmessage = message => {
          const hasMetadata = Boolean(this.getMetadata());

          const msg = this.handleStudioMsg(message.data);

          if (!msg) {
            return;
          }

          return parseStreamMessage({
            message: msg,
            onResult: this.onXVIZMessage,
            onError: this.onError,
            debug: this._debug.bind(this, 'parse_message'),
            worker: false, // hasMetadata && this.options.worker,
            maxConcurrency: this.options.maxConcurrency
          });
        };

        ws.onerror = this.onError;
        ws.onclose = event => {
          this._onWSClose(event);
          reject(event);
        };

        // On success, resolve the promise with the now ready socket
        ws.onopen = () => {
          this.socket = ws;
          this._onWSOpen();
          resolve(ws);
        };
      } catch (err) {
        reject(err);
      }
    }).catch(event => {
      this._onWSError(event);
    });
  }

  _onXVIZTimeslice(message) {
    message.timestamp = this.counter;
    this.counter += 0.1;

    super._onXVIZTimeslice(message);

    if (message.timestamp === 0) {
      this._onXVIZMetadata({
        type: 'xviz/metadata',
        start_time: 0,
        end_time: 300,
        data: {
          version: '2.0.0'
        },
        streams: {}
      });
      this.seek(0);
    }
  }
}
