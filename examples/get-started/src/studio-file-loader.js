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

/* eslint-disable camelcase */
import assert from 'assert';
import {parseStreamMessage, XVIZStreamBuffer} from '@xviz/parser';
import {XVIZ_PROTOBUF_MESSAGE} from '@xviz/io';
import {_XVIZLoaderInterface} from 'streetscape.gl';

import {SCCLog} from './studio-data';

const XVIZ_PROTOBUF_MAGIC = Uint8Array.from([0x50, 0x42, 0x45, 0x31]);

export class StudioFileLoader extends _XVIZLoaderInterface {
  constructor(options = {}) {
    super(options);
    this.url = options.url;
    this.lastRequest = {startTimestamp: 0};

    this.counter = 0;
    this.log = 0;

    this.streamBuffer = new XVIZStreamBuffer();
    this._isOpen = false;
    this.set('streamsettings', {});
  }

  isOpen() {
    return this._isOpen;
  }

  close() {
    this._isOpen = false;
  }

  handleStudioMsg3(arrayBuffer) {
    const strippedBuffer = new Uint8Array(arrayBuffer, 4);
    const envelope = XVIZ_PROTOBUF_MESSAGE.Envelope.decode(strippedBuffer);
    const xviz = {
      type: envelope.type.substring(envelope.type.lastIndexOf("/") + 1),
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
       his. */
      case '/xviz/stream_set':
        const tmpSet = XVIZ_PROTOBUF_MESSAGE.StreamSet.decode(envelope.data.value);

        state =  {
          update_type: "INCREMENTAL",
          updates: [tmpSet]
        };
        break;
      default:
        break;
        // throw new Error(`Unknown Message type ${envelope.type}`);
    }

    if (state) {
      const env = {
        type: "xviz/state_update",
        data: state
      }
      return env;
    } 

    return undefined;
  }

  handleStudioMsg(arrayBuffer) {
    const strippedBuffer = new Uint8Array(arrayBuffer, 4);
    const envelope = XVIZ_PROTOBUF_MESSAGE.Envelope.decode(strippedBuffer);
    const xviz = {
      type: envelope.type.substring(envelope.type.lastIndexOf("/") + 1),
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
       his. */
      case '/xviz/stream_set':
        const tmpSet = XVIZ_PROTOBUF_MESSAGE.StreamSet.decode(envelope.data.value);

        const update =  {
          update_type: XVIZ_PROTOBUF_MESSAGE.StateUpdate.UpdateType.INCREMENTAL,
          updates: [tmpSet]
        }

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
        type: "xviz/state_update",
        data: {type_url: 'xviz.v2.StateUpdate', value: state}
      }
      const msg = XVIZ_PROTOBUF_MESSAGE.Envelope.encode(env).finish();
      const buffer = new Uint8Array(msg.byteLength + 4);
      buffer.set(XVIZ_PROTOBUF_MAGIC, 0);
      buffer.set(msg, 4);
      return buffer.buffer;
    } 

    return undefined;
  }

  connect() {
    this.log = new SCCLog(message => {
      const msg = this.handleStudioMsg(message);
      
      if (!msg) {
        return;
      }

      return parseStreamMessage({
        message: msg,
        onResult: this.onXVIZMessage,
        onError: this.onError,
        debug: this._debug.bind(this, 'parse_message'),
        worker: false,
        maxConcurrency: this.options.maxConcurrency
      });
    }); 
    this.log.open(this.url);
    this._isOpen = true;
  }

  _onXVIZTimeslice(message) {
    message.timestamp = this.counter;
    this.counter +=0.2;

    super._onXVIZTimeslice(message);

    if (message.timestamp === 0) {
      this._onXVIZMetadata({
        type: "xviz/metadata",
        start_time: 0,
        end_time: 180,
        data: {
          version: "2.0.0"
        },
        streams: {}
      });
      this.seek(0);
    }
  }
}
