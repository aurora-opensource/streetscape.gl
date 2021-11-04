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

import {getTimeSeriesStreamEntry} from './stream-utils';

const getX = d => d.time;

// Returns timeSeries values for the first stream entry, excluding entries with an object_id.
function getTimeSeriesForStream(streamName, metadata, stream, target) {
  if (metadata.nograph) {
    return;
  }

  const mapper = metadata.valueMap;
  const scale = metadata.scale || 1;
  const getY = mapper ? d => mapper[d.variable] : d => d.variable * scale;
  const entry = stream.find(getTimeSeriesStreamEntry);
  const sampleDatum = getTimeSeriesStreamEntry(entry);
  if (!sampleDatum || !Number.isFinite(getY(sampleDatum))) {
    return;
  }

  target.isLoading = false;
  target.getX = getX;
  target.getY = getY;
  target.unit = metadata.unit || '';
  target.data[streamName] = stream.filter(getTimeSeriesStreamEntry).map(getTimeSeriesStreamEntry);
}

/**
 * Get the stream time series for the given streams.
 *
 * If the stream contains multiple time entries the first stream level
 * entry is use, which should be the entry with the smallest time.
 *
 * A stream level entry is one with no object_id.
 *
 * @param streamsMetadata {object} map from stream names to stream metadata
 * @param streams array of timeSeries streams data. The array contains either
 *                a single entry or an array of entries
 * @returns {Array} array of time series data
 */
export function getTimeSeries({streamsMetadata = {}, streamNames, streams}) {
  const timeSeries = {
    isLoading: true,
    data: {},
    missingStreams: []
  };
  for (const streamName of streamNames) {
    // ui configuration for this stream
    const streamMetadata = (streamsMetadata && streamsMetadata[streamName]) || {};
    const stream = streams[streamName];
    if (stream) {
      getTimeSeriesForStream(streamName, streamMetadata, stream, timeSeries);
    }
  }

  timeSeries.missingStreams = streamNames.filter(
    streamToDisplay => !timeSeries.data[streamToDisplay]
  );

  return timeSeries;
}
