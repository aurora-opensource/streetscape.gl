import test from 'tape';

import {getTimeSeries} from 'streetscape.gl/utils/metrics-helper';

test('metricsHelper#getTimeSeries', t => {
  const streamName = '/velocity';
  const stream = {
    time: '123',
    variable: 123
  };

  const logMetadata = {
    streams: {
      [streamName]: {}
    }
  };

  let uiMetadata = {};
  const streams = {
    [streamName]: [stream]
  };

  let actual = getTimeSeries({logMetadata, uiMetadata, streams});
  t.deepEqual(
    actual,
    [],
    `Should return empty when there is no definition uiMetadata for stream ${streamName}.`
  );

  uiMetadata = {
    [streamName]: {}
  };

  actual = getTimeSeries({logMetadata, uiMetadata, streams});
  t.equal(actual[0].id, streamName);
  t.equal(actual[0].unit, '');
  t.equal(actual[0].title, streamName);
  t.deepEqual(actual[0].valueSeries, [stream]);

  uiMetadata = {
    [streamName]: {
      title: 'Velocity',
      unit: 'm/s'
    }
  };

  actual = getTimeSeries({logMetadata, uiMetadata, streams});
  t.equal(actual[0].unit, 'm/s');
  t.equal(actual[0].title, 'Velocity');

  t.end();
});
