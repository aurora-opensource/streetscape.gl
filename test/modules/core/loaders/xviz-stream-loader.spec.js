/* global setTimeout */
import test from 'tape-catch';

import {setXVIZConfig, getXVIZConfig, LOG_STREAM_MESSAGE} from '@xviz/parser';
import {XVIZStreamLoader} from 'streetscape.gl';
import {updateSocketRequestParams} from 'streetscape.gl/loaders/xviz-stream-loader';

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

const SAMPLE_METADATA = {start_time: 0, end_time: 30};
const TEST_CASES = [
  {
    title: 'no buffer length',
    metadata: SAMPLE_METADATA,
    timestamp: 0,
    bufferLength: null,
    bufferRange: [],
    result: {
      startTimestamp: 0,
      endTimestamp: 30,
      bufferStart: 0,
      bufferEnd: 30
    }
  },
  {
    title: 'big buffer length',
    metadata: SAMPLE_METADATA,
    timestamp: 0,
    bufferLength: 40,
    bufferRange: [],
    result: {
      startTimestamp: 0,
      endTimestamp: 30,
      bufferStart: 0,
      bufferEnd: 30
    }
  },
  {
    title: 'initial buffer',
    metadata: SAMPLE_METADATA,
    timestamp: 0,
    bufferLength: 10,
    bufferRange: [],
    result: {
      startTimestamp: 0,
      endTimestamp: 10,
      bufferStart: 0,
      bufferEnd: 10
    }
  },
  {
    title: 'incremental seek',
    metadata: SAMPLE_METADATA,
    timestamp: 1,
    bufferLength: 10,
    bufferRange: [[0, 10]],
    result: null
  },
  {
    title: 'incremental seek',
    metadata: SAMPLE_METADATA,
    timestamp: 6,
    bufferLength: 10,
    bufferRange: [[0, 10]],
    result: {
      startTimestamp: 10,
      endTimestamp: 11,
      bufferStart: 1,
      bufferEnd: 11
    }
  },
  {
    title: 'jump forward',
    metadata: SAMPLE_METADATA,
    timestamp: 12,
    bufferLength: 10,
    bufferRange: [[1, 11]],
    result: {
      startTimestamp: 11,
      endTimestamp: 17,
      bufferStart: 7,
      bufferEnd: 17
    }
  },
  {
    title: 'jump to end',
    metadata: SAMPLE_METADATA,
    timestamp: 30,
    bufferLength: 10,
    bufferRange: [[7, 17]],
    result: {
      startTimestamp: 25,
      endTimestamp: 30,
      bufferStart: 25,
      bufferEnd: 30
    }
  },
  {
    title: 'jump backward',
    metadata: SAMPLE_METADATA,
    timestamp: 8,
    bufferLength: 10,
    bufferRange: [[7, 17]],
    result: {
      startTimestamp: 3,
      endTimestamp: 7,
      bufferStart: 3,
      bufferEnd: 13
    }
  },
  {
    title: 'no start time - initial buffer',
    metadata: {},
    timestamp: 0,
    bufferLength: 10,
    bufferRange: [],
    result: {
      startTimestamp: -5,
      endTimestamp: 5,
      bufferStart: -5,
      bufferEnd: 5
    }
  }
];

test('updateSocketRequestParams', t => {
  TEST_CASES.forEach(testCase => {
    t.deepEquals(
      updateSocketRequestParams(
        testCase.timestamp,
        testCase.metadata,
        testCase.bufferLength,
        testCase.bufferRange
      ),
      testCase.result,
      testCase.title
    );
  });

  t.end();
});

test('XVIZStreamLoader#connect, seek', t => {
  const loader = new XVIZStreamLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    },
    logGuid: 'test_log',
    duration: 30,
    bufferLength: 10
  });

  const oldConfig = getXVIZConfig();
  setXVIZConfig({
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
    t.deepEquals(socket.flush(), [], 'No data till metadata');

    // Mock metadata
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.METADATA, start_time: 1000, end_time: 1030});
    t.deepEquals(
      socket.flush(),
      [{type: 'xviz/transform_log', data: {start_timestamp: 1000, end_timestamp: 1010, id: '0'}}],
      'transform_log: update with correct parameters'
    );

    loader.seek(1005);
    t.deepEquals(socket.flush(), [], 'seek: no socket updates');

    loader.seek(1012);
    t.deepEquals(
      socket.flush(),
      [{type: 'xviz/transform_log', data: {start_timestamp: 1007, end_timestamp: 1017, id: '1'}}],
      'seek: update with correct parameters'
    );

    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1008});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1009});
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1010});

    loader.seek(1001);
    t.deepEquals(
      socket.flush(),
      [{type: 'xviz/transform_log', data: {start_timestamp: 1000, end_timestamp: 1007, id: '2'}}],
      'seek: update with correct parameters'
    );

    setXVIZConfig(oldConfig);
    t.end();
  });
});

test('XVIZStreamLoader#metadata missing start_time', t => {
  setXVIZConfig({});

  const loader = new XVIZStreamLoader({
    WebSocketClass: MockSocket,
    serverConfig: {
      serverUrl: 'http://localhost:3000'
    },
    logGuid: 'test_log',
    duration: 30
  });

  loader.connect().then(() => {
    t.ok(loader.isOpen(), 'socket connected');
    const {socket} = loader;
    t.is(
      socket.url,
      'http://localhost:3000?log=test_log&profile=default',
      'socket connected to correct url'
    );
    t.deepEquals(socket.flush(), [], 'No data till metadata');

    // Mock metadata with missing start_time
    loader._onWSMessage({type: LOG_STREAM_MESSAGE.METADATA});
    t.deepEquals(
      socket.flush(),
      [{type: 'xviz/transform_log', data: {id: '0'}}],
      'transform_log: called without time parameters if metadata is missing start_time'
    );

    loader._onWSMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});

    loader.seek(1007);
    t.deepEquals(socket.flush(), [], 'seek: no seek since default buffer length in liveMode is 30');

    t.equals(loader.getBufferStart(), 1007, 'getBufferStart() based on first message');
    t.equals(
      loader.getBufferEnd(),
      31007,
      'getBufferEnd() based on first message + 30 second default'
    );

    t.equals(loader.getLogStartTime(), undefined, 'getLogStartTime() is undefined in liveMode');
    t.equals(loader.getLogEndTime(), undefined, 'getLogEndTime() is undefined in liveMode');
    t.end();
  });
});
