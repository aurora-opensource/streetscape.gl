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

import test from 'tape';

import {getTimeSeries} from 'streetscape.gl/utils/metrics-helper';

test('metricsHelper#getTimeSeries', t => {
  const streamName = '/velocity';
  const stream = {
    time: '123',
    variable: 123
  };

  const metadata = {
    streams: {}
  };

  const streams = {
    [streamName]: [stream]
  };

  let actual = getTimeSeries({metadata, streams});
  t.deepEqual(
    actual,
    [],
    `Should return empty when there is no metadata for stream ${streamName}.`
  );

  metadata.streams[streamName] = {};

  actual = getTimeSeries({metadata, streams});
  t.equal(actual[streamName].id, streamName);
  t.equal(actual[streamName].unit, '');
  t.equal(actual[streamName].title, streamName);
  t.deepEqual(actual[streamName].valueSeries, [stream]);

  metadata.streams[streamName] = {
    title: 'Velocity',
    unit: 'm/s'
  };

  actual = getTimeSeries({metadata, streams});
  t.equal(actual[streamName].unit, 'm/s');
  t.equal(actual[streamName].title, 'Velocity');

  t.end();
});
