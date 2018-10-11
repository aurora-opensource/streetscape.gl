/* global setTimeout */
import test from 'tape-catch';

import {getXvizSettings, setXvizSettings} from '@xviz/parser';
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
    this.messages.push(message);
  }
  lastMessage() {
    if (this.messages.length === 0) {
      return null;
    }
    return JSON.parse(this.messages.pop());
  }
  close() {
    if (this.onclose) {
      this.onclose({});
    }
  }
}

test('XvizStreamLoader#connect, seek', t => {
  const loader = new XVIZStreamLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    },
    logGuid: 'test_log',
    timestamp: 1000,
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
      socket.lastMessage(),
      {type: 'open_log', duration: 11, timestamp: 1000},
      'initial hand shake'
    );

    loader.seek(1005);
    t.notOk(socket.lastMessage(), 'seek: no socket updates');

    loader.seek(1011.1);
    t.deepEquals(
      socket.lastMessage(),
      {type: 'open_log', duration: 11, timestamp: 1010.1},
      'seek: update with correct parameters'
    );

    loader.streamBuffer.timeslices = TEST_TIMESLICES;
    loader.seek(1001);
    t.deepEquals(
      socket.lastMessage(),
      {type: 'open_log', duration: 6, timestamp: 1000},
      'seek: update with correct parameters'
    );

    setXvizSettings(oldSettings);
    t.end();
  });
});
