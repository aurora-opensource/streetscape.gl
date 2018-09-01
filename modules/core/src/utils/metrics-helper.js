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
 * @param streams array of streams data
 * @returns {Array} array of time series data
 */
export function getTimeSeries({metadata = {}, streams}) {
  const timeSeries = {};
  for (const streamName in streams) {
    // if there is ui configuration for this stream
    if (streams.hasOwnProperty(streamName) && metadata.streams && metadata.streams[streamName]) {
      const stream = streams[streamName];
      const streamTimeSeries = getTimeSeriesForStream({
        metadata: metadata.streams[streamName],
        streamName,
        stream
      });
      Object.assign(timeSeries, streamTimeSeries);
    }
  }

  return timeSeries;
}
