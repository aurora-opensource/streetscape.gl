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
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.METADATA, data: {version: '2.0.0'}});
    t.deepEquals(socket.flush(), [], 'No client request after metadata');

    loader.seek(1005);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1008});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1009});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1010});

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
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.METADATA});
    t.deepEquals(socket.flush(), [], 'No client request after metadata');

    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});

    loader.seek(1007);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    t.equals(
      loader.getBufferStart(),
      987,
      'getBufferStart() based on first message - 30/3 * 2 preBuffer'
    );
    t.equals(
      loader.getBufferEnd(),
      1017,
      'getBufferEnd() based on first message + 30/3 = 10 postBuffer'
    );

    t.equals(loader.getLogStartTime(), undefined, 'getLogStartTime() is undefined in liveMode');
    t.equals(loader.getLogEndTime(), undefined, 'getLogEndTime() is undefined in liveMode');
    t.end();
  });
});
