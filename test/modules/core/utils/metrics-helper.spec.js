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
