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

import {setXVIZConfig, getXVIZConfig, LOG_STREAM_MESSAGE} from '@xviz/parser';
import {XVIZLiveLoader} from 'streetscape.gl';

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

test('XVIZLiveLoader#connect, seek', t => {
  const loader = new XVIZLiveLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    },
    bufferLength: 10
  });

  const oldConfig = getXVIZConfig();
  setXVIZConfig({
    TIME_WINDOW: 1
  });

  loader.connect().then(() => {
    t.ok(loader.isOpen(), 'socket connected');
    const {socket} = loader;
    t.is(socket.url, 'http://localhost:3000?profile=default', 'socket connected to correct url');
    t.deepEquals(socket.flush(), [], 'No data till metadata');

    // Mock metadata
    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.METADATA, data: {version: '2.0.0'}});
    t.deepEquals(socket.flush(), [], 'No client request after metadata');

    loader.seek(1005);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});
    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1008});
    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1009});
    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1010});

    // t.deepEquals(loader.getBufferRange(), [[1, 2]], 'BufferRange includes all messages');

    setXVIZConfig(oldConfig);
    t.end();
  });
});

test('XVIZLiveLoader#metadata missing start_time', t => {
  setXVIZConfig({});

  const loader = new XVIZLiveLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    }
  });

  loader.connect().then(() => {
    t.ok(loader.isOpen(), 'socket connected');
    const {socket} = loader;
    t.is(socket.url, 'http://localhost:3000?profile=default', 'socket connected to correct url');
    t.deepEquals(socket.flush(), [], 'No data till metadata');

    // Mock metadata with missing start_time
    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.METADATA});
    t.deepEquals(socket.flush(), [], 'No client request after metadata');

    loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});

    loader.seek(1007);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    t.equals(
      loader.getBufferStartTime(),
      987,
      'getBufferStartTime() based on first message - 30/3 * 2 preBuffer'
    );
    t.equals(
      loader.getBufferEndTime(),
      1017,
      'getBufferEndTime() based on first message + 30/3 = 10 postBuffer'
    );

    t.equals(loader.getLogStartTime(), undefined, 'getLogStartTime() is undefined in liveMode');
    t.equals(loader.getLogEndTime(), undefined, 'getLogEndTime() is undefined in liveMode');
    t.end();
  });
});
