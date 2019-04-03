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
import test from 'tape-catch';

import {LOG_STREAM_MESSAGE} from '@xviz/parser';
import {_XVIZLoaderInterface} from 'streetscape.gl';

class TestStreamBuffer {
  constructor() {
    this.setCurrentTimeValue = 0;
    this.data = [];
  }

  // called on Loader.seek()
  setCurrentTime(time) {
    this.setCurrentTimeValue = time;
  }

  // called with parsed XVIZ via Loader.onXVIZMessage() with a timeslice
  insert(timeslice) {
    this.data.push(timeslice);
  }
}

class TestLoaderInterface extends _XVIZLoaderInterface {
  constructor({streamBuffer}) {
    super();

    this.streamBuffer = streamBuffer;
  }

  connect() {
    return Promise.resolve();
  }

  close() {}
}

test('XVIZLoaderInterface#loader.seek() propagates to streamBuffer', t => {
  const streamBuffer = new TestStreamBuffer();
  const loader = new TestLoaderInterface({streamBuffer});

  loader.seek(1001.1);
  t.equal(
    1001.1,
    streamBuffer.setCurrentTimeValue,
    'streamBuffer received time from seek() on loader'
  );
  t.end();
});

test('XVIZLoaderInterface#streamBuffer.insert() called on timeslice', t => {
  const streamBuffer = new TestStreamBuffer();
  const loader = new TestLoaderInterface({streamBuffer});

  loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1007});
  loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1008});
  loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1009});
  loader.onXVIZMessage({type: LOG_STREAM_MESSAGE.TIMESLICE, timestamp: 1010});

  t.equal(streamBuffer.data.length, 4, 'streamBuffer was populated with timeslices');
  t.end();
});
