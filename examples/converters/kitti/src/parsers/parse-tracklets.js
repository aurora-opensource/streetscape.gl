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

/**
 * Parse tracklets objects (stored in tracklet_labels.xml),
 */
const parser = require('xml2json');
const uuid = require('uuid').v4;

function loadTracklets(tracklets_contents) {
  const raw_data = JSON.parse(parser.toJson(tracklets_contents));
  const tracklets = raw_data.boost_serialization.tracklets;

  const objects = parseObjectMetadata(tracklets);

  return {objects, tracklets};
}

function parseObjectMetadata(tracklets) {
  return tracklets.item.map(item => {
    const properties = {
      id: uuid(),
      objectType: item.objectType,
      width: Number(item.w),
      height: Number(item.h),
      length: Number(item.l)
    };

    const bounds = [
      [-item.l / 2, -item.w / 2],
      [-item.l / 2, item.w / 2],
      [item.l / 2, item.w / 2],
      [item.l / 2, -item.w / 2],
      [-item.l / 2, -item.w / 2]
    ];

    const first_frame = Number(item.first_frame);
    const count = Number(item.poses.count);
    const last_frame = first_frame + count;
    return {
      data: item,
      first_frame,
      last_frame,
      count,
      properties,
      bounds
    };
  });
}

module.exports = {
  loadTracklets
};
