// TODO add documentation and tests

function getTimeSeriesForStream({metadata, streamName, stream}) {
  // See if we have some metadata for this metric
  if (!metadata || metadata.nograph) {
    return null;
  }

  const mapper = metadata.valueMap;
  const scale = metadata.scale || 1;
  const getX = d => d.time;
  const getY = mapper ? d => mapper[d.variable] : d => d.variable * scale;

  const sampleDatum = stream[0];
  if (!sampleDatum || !Number.isFinite(getY(sampleDatum))) {
    return null;
  }

  const metrics = {};
  metrics[streamName] = {
    id: streamName,
    ...metadata,
    getX,
    getY,
    title: metadata.title || streamName,
    unit: metadata.unit || '',
    valueSeries: stream
  };

  return metrics;
}

/**
 * Get the time range of a time series
 * @param valueSeries array of time and variable pair
 * @returns {Array | null} [minTime, maxTime]
 */
export function getTimeRange(valueSeries) {
  if (valueSeries || valueSeries.length) {
    const {min, max} = valueSeries.reduce(
      (acc, value) => {
        acc.min = Math.min(acc.min, value.time);
        acc.max = Math.max(acc.max, value.time);
      },
      {min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY}
    );

    return [min, max];
  }

  return null;
}

/**
 * Get the time series for given streams
 * @param metadata {object} log metadata
 * @param streams array of streams data
 * @returns {Array} array of time series data
 */
export function getTimeSeries({metadata, streams}) {
  const timeSeries = {};
  for (const streamName in streams) {
    if (streams.hasOwnProperty(streamName)) {
      const stream = streams[streamName];
      const streamTimeSeries = getTimeSeriesForStream({
        metadata: metadata.streams[streamName],
        streamName,
        stream
      });
      Object.assign(timeSeries, streamTimeSeries);
    }
  }

  return Object.values(timeSeries);
}
