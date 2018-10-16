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

/* global setTimeout */
import test from 'tape-catch';

import {setXvizConfig, getXvizSettings, setXvizSettings, LOG_STREAM_MESSAGE} from '@xviz/parser';
import {XVIZStreamLoader} from 'streetscape.gl';

/* eslint-disable camelcase */
class MockSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.messages = [];
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) {
        this.onopen({});
      }
    }, 0);
  }
  send(message) {
    message = JSON.parse(message);
    this.messages.push(message);
  }
  flush() {
    const messages = this.messages;
    this.messages = [];
    return messages;
  }
  close() {
    if (this.onclose) {
      this.onclose({});
    }
  }
}

test('XvizStreamLoader#connect, seek', t => {
  setXvizConfig({});

  const loader = new XVIZStreamLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    },
    logGuid: 'test_log',
    duration: 30,
    bufferLength: 10
  });

  const oldSettings = getXvizSettings();
  setXvizSettings({
    TIME_WINDOW: 1
  });

  loader.connect().then(() => {
    t.ok(loader.isOpen(), 'socket connected');
    const {socket} = loader;
    t.is(
      socket.url,
      'http://localhost:3000?log=test_log&profile=default',
      'socket connected to correct url'
    );
    t.deepEquals(
      socket.flush(),
      [{type: 'open', duration: 30}, {type: 'metadata'}],
      'initial hand shake'
    );

    // Mock metadata
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.METADATA, start_time: 1000, end_time: 1030});
    t.deepEquals(
      socket.flush(),
      [{type: 'play', duration: 10, timestamp: 1000}],
      'seek: update with correct parameters'
    );

    loader.seek(1005);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    loader.seek(1012);
    t.deepEquals(
      socket.flush(),
      [{type: 'play', duration: 10, timestamp: 1007}],
      'seek: update with correct parameters'
    );

    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1008});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1009});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1010});

    loader.seek(1001);
    t.deepEquals(
      socket.flush(),
      [{type: 'play', duration: 7, timestamp: 1000}],
      'seek: update with correct parameters'
    );

    setXvizSettings(oldSettings);
    t.end();
  });
});
