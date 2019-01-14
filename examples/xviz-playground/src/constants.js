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

/* eslint-disable camelcase */
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v9';

export const XVIZ_CONFIG = {
  PLAYBACK_FRAME_RATE: 10
};

export const CODE_SAMPLE_METADATA = `// metadata
xvizMetadataBuilder
  .stream('/vehicle_pose')
  .category('pose')

  .stream('/object/tracking_point')
  .category('primitive')
  .type('circle')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    fill_color: '#fb0'
  })

  .stream('/object/shape')
  .category('primitive')
  .type('polygon')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    extruded: true
  })
 
  .startTime(1000)
  .endTime(1010);
`;

export const CODE_SAMPLE_FRAME = `// frame
const timestamp = 1000;

xvizBuilder.pose('/vehicle_pose')
  .timestamp(timestamp)
  .mapOrigin(-122.4, 37.8, 0)
  .orientation(0, 0, 0);
  
xvizBuilder.primitive('/object/tracking_point')
  .circle([10, 10, 0])
  .id('object-1');

xvizBuilder.primitive('/object/shape')
  .polygon([[-5, 20, 0], [5, 14, 0], [8, 18, 0]])
  .style({
    fill_color: '#08f',
    height: 2
  })
  .id('object-2');
`;
