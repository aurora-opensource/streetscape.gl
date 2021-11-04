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

import {getTimeSeries} from '@streetscape.gl/core/utils/metrics-helper';

// XVIZ in 1.0.10 changes the structure of the time_series to allow for multiple
// entries. This test ensures streetscape supports both runtime formats
test('metricsHelper#pre-xviz/parse-1.0.10-getTimeSeries', t => {
  const streamsMetadata = {
    '/numerical': {
      unit: 'mph',
      scale: 2.23694
    },
    '/no_graph': {
      nograph: true
    },
    '/value_map': {
      valueMap: {left: -1, none: 0, right: 1}
    },
    '/empty': {
      unit: 'rad'
    }
  };

  const streams = {
    '/numerical': [
      {time: 1000, variable: 1},
      {time: 1001, variable: 1.2},
      undefined,
      {time: 1003, variable: 0.8}
    ],
    '/no_graph': [
      {time: 1000, variable: 1},
      {time: 1001, variable: 2},
      {time: 1002, variable: 1},
      {time: 1003, variable: 2}
    ],
    '/value_map': [
      {time: 1000, variable: 'left'},
      {time: 1001, variable: 'left'},
      {time: 1002, variable: 'none'},
      {time: 1003, variable: 'right'}
    ],
    '/empty': [undefined, undefined, undefined, undefined]
  };

  let result = getTimeSeries({streamsMetadata, streamNames: [], streams});
  t.deepEqual(result.data, {}, 'Should return empty when no streams are requested.');

  result = getTimeSeries({streamNames: ['/numerical'], streams});
  t.ok(result.data['/numerical'], 'Should work without metadata');

  result = getTimeSeries({streamsMetadata, streamNames: ['/numerical'], streams});
  t.is(result.getX(result.data['/numerical'][0]), 1000, 'getX is properly set');
  t.is(result.getY(result.data['/numerical'][0]), 2.23694, 'getY is properly set');
  t.is(result.unit, 'mph', 'unit is properly set');
  t.ok(result.data['/numerical'].every(Boolean), 'Missing frames are filtered out');
  t.notOk(result.isLoading, 'Should not show spinner');

  result = getTimeSeries({streamsMetadata, streamNames: ['/no_graph'], streams});
  t.deepEqual(result.data, {}, 'Should respect metadata setting');
  t.ok(result.isLoading, 'Should show spinner when no stream is available');

  result = getTimeSeries({streamsMetadata, streamNames: ['/value_map'], streams});
  t.is(result.getY(result.data['/value_map'][0]), -1, 'getY is properly set for custom mapping');
  t.notOk(result.isLoading, 'Should not show spinner');

  result = getTimeSeries({streamsMetadata, streamNames: ['/empty'], streams});
  t.deepEqual(result.data, {}, 'Should return empty when no valid frames are found');
  t.ok(result.isLoading, 'Should show spinner when no stream is available');

  t.end();
});

test('metricsHelper#getTimeSeries', t => {
  const streamsMetadata = {
    '/numerical': {
      unit: 'mph',
      scale: 2.23694
    },
    '/no_graph': {
      nograph: true
    },
    '/value_map': {
      valueMap: {left: -1, none: 0, right: 1}
    },
    '/empty': {
      unit: 'rad'
    }
  };

  const streams = {
    '/numerical': [
      [{time: 1000, variable: 1}, {time: 1002, variable: 3}],
      [{time: 1001, variable: 1.2}],
      undefined,
      [{time: 1003, variable: 0.8}]
    ],
    '/no_graph': [
      [{time: 1000, variable: 1}],
      [{time: 1001, variable: 2}],
      [{time: 1002, variable: 1}],
      [{time: 1003, variable: 2}]
    ],
    '/value_map': [
      [{time: 1000, variable: 'left'}],
      [{time: 1001, variable: 'left'}],
      [{time: 1002, variable: 'none'}],
      [{time: 1003, variable: 'right'}]
    ],
    '/empty': [undefined, undefined, undefined, undefined]
  };

  let result = getTimeSeries({streamsMetadata, streamNames: [], streams});
  t.deepEqual(result.data, {}, 'Should return empty when no streams are requested.');

  result = getTimeSeries({streamNames: ['/numerical'], streams});
  t.ok(result.data['/numerical'], 'Should work without metadata');

  result = getTimeSeries({streamsMetadata, streamNames: ['/numerical'], streams});
  t.is(result.getX(result.data['/numerical'][0]), 1000, 'getX is properly set');
  t.is(result.getY(result.data['/numerical'][0]), 2.23694, 'getY is properly set');
  t.is(result.unit, 'mph', 'unit is properly set');
  t.ok(result.data['/numerical'].every(Boolean), 'Missing frames are filtered out');
  t.notOk(result.isLoading, 'Should not show spinner');

  result = getTimeSeries({streamsMetadata, streamNames: ['/no_graph'], streams});
  t.deepEqual(result.data, {}, 'Should respect metadata setting');
  t.ok(result.isLoading, 'Should show spinner when no stream is available');

  result = getTimeSeries({streamsMetadata, streamNames: ['/value_map'], streams});
  t.is(result.getY(result.data['/value_map'][0]), -1, 'getY is properly set for custom mapping');
  t.notOk(result.isLoading, 'Should not show spinner');

  result = getTimeSeries({streamsMetadata, streamNames: ['/empty'], streams});
  t.deepEqual(result.data, {}, 'Should return empty when no valid frames are found');
  t.ok(result.isLoading, 'Should show spinner when no stream is available');

  t.end();
});
