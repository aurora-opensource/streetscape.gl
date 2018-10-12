/* global setTimeout */
import test from 'tape-catch';

import {setXvizConfig, getXvizSettings, setXvizSettings, LOG_STREAM_MESSAGE} from '@xviz/parser';
import {XVIZStreamLoader} from 'streetscape.gl';

const TEST_TIMESLICES = [
  {
    id: 'TS-1',
    timestamp: 1006,
    channels: {A: 1, C: 1}
  },
  {
    id: 'TS-2',
    timestamp: 1007,
    channels: {A: 2, B: 0}
  },
  {
    id: 'TS-3',
    timestamp: 1008,
    channels: {A: 5}
  },
  {
    id: 'TS-4',
    timestamp: 1009,
    channels: {A: 3}
  },
  {
    id: 'TS-5',
    timestamp: 1010,
    channels: {A: 4, B: -1}
  },
  {
    id: 'TS-6',
    timestamp: 1011,
    channels: {A: 1.1}
  }
];

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
      [{type: 'play', duration: 11, timestamp: 1000}],
      'seek: update with correct parameters'
    );

    loader.seek(1005);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    loader.seek(1011.1);
    t.deepEquals(
      socket.flush(),
      [{type: 'play', duration: 11, timestamp: 1010.1}],
      'seek: update with correct parameters'
    );

    loader.streamBuffer.timeslices = TEST_TIMESLICES;
    loader.seek(1001);
    t.deepEquals(
      socket.flush(),
      [{type: 'play', duration: 6, timestamp: 1000}],
      'seek: update with correct parameters'
    );

    setXvizSettings(oldSettings);
    t.end();
  });
});
