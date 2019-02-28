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

const getX = d => d.time;
const variableNullFilter = value => value !== undefined;

function getTimeSeriesForStream(streamName, metadata, stream, target) {
  if (metadata.nograph) {
    return;
  }

  const mapper = metadata.valueMap;
  const scale = metadata.scale || 1;
  const getY = mapper ? d => mapper[d.variable] : d => d.variable * scale;

  const sampleDatum = stream.find(variableNullFilter);
  if (!sampleDatum || !Number.isFinite(getY(sampleDatum))) {
    return;
  }

  target.isLoading = false;
  target.getX = getX;
  target.getY = getY;
  target.unit = metadata.unit || '';
  target.data[streamName] = stream.filter(variableNullFilter);
}

/**
 * Get the time series for given streams
 * @param logMetadata {object} log metadata
 * @param streams array of streams data
 * @returns {Array} array of time series data
 */
export function getTimeSeries({metadata = {}, streamNames, streams}) {
  const timeSeries = {
    isLoading: true,
    data: {}
  };
  for (const streamName of streamNames) {
    // ui configuration for this stream
    const streamMetadata = (metadata.streams && metadata.streams[streamName]) || {};
    const stream = streams[streamName];
    if (stream) {
      getTimeSeriesForStream(streamName, streamMetadata, stream, timeSeries);
    }
  }

  return timeSeries;
}
