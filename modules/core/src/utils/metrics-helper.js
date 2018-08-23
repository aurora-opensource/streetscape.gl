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
 * Get the time series for given streams
 * @param logMetadata {object} log metadata
 * @param uiMetadata {object} declare ui metadata
 * @param streams array of streams data
 * @returns {Array} array of time series data
 */
export function getTimeSeries({logMetadata = {}, uiMetadata = {}, streams}) {
  const timeSeries = {};
  for (const streamName in streams) {
    // if there is ui configuration for this stream
    if (streams.hasOwnProperty(streamName) && uiMetadata[streamName]) {
      const stream = streams[streamName];
      const streamTimeSeries = getTimeSeriesForStream({
        metadata: {
          ...logMetadata.streams[streamName],
          ...uiMetadata[streamName]
        },
        streamName,
        stream
      });
      Object.assign(timeSeries, streamTimeSeries);
    }
  }

  return Object.values(timeSeries);
}
