/* global setTimeout */
import test from 'tape-catch';

import {setXVIZConfig, getXVIZSettings, setXVIZSettings, LOG_STREAM_MESSAGE} from '@xviz/parser';
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

test('XVIZStreamLoader#connect, seek', t => {
  setXVIZConfig({});

  const loader = new XVIZStreamLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    },
    logGuid: 'test_log',
    duration: 30,
    bufferLength: 10
  });

  const oldSettings = getXVIZSettings();
  setXVIZSettings({
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

    setXVIZSettings(oldSettings);
    t.end();
  });
});
