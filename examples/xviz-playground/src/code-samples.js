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

const streamMetadata = {
  circle: `
  .stream('/object/tracking_point')
  .category('PRIMITIVE')
  .type('CIRCLE')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    fill_color: '#fb0'
  })
`,
  polygon: `
  .stream('/object/shape')
  .category('PRIMITIVE')
  .type('POLYGON')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    fill_color: '#fb0',
    height: 1.5,
    extruded: true
  })
`,
  polyline: `
  .stream('/prediction/trajectory')
  .category('PRIMITIVE')
  .type('POLYLINE')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    stroke_color: '#f08'
  })
`,
  points: `
  .stream('/lidar/points')
  .category('PRIMITIVE')
  .type('POINTS')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    point_color_mode: 'ELEVATION',
    point_color_domain: [0, 3],
    radius_pixels: 4
  })
`,
  stadium: `
  .stream('/motion_planning/vehicle')
  .category('PRIMITIVE')
  .type('STADIUM')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    fill_color: '#8888',
    radius: 1
  })
`,
  text: `
  .stream('/object/label')
  .category('PRIMITIVE')
  .type('TEXT')
  .coordinate('VEHICLE_RELATIVE')
  .streamStyle({
    font_family: 'Arial',
    font_weight: 'bold',
    text_size: 24,
    fill_color: '#000'
  })
`
};

const streamSample = {
  circle: `
  .primitive('/object/tracking_point')
  .circle([10, 10, 0], 1)
  .id('object-1')

  .circle([3, 18.5, 0], 2)
  .id('object-2')
  .style({fill_color: '#048'})
`,
  polygon: `
  .primitive('/object/shape')
  .polygon([[10, 14, 0], [7, 10, 0], [13, 6, 0]])
  .id('object-1')

  .polygon([[-2, 20, 0], [5, 14, 0], [8, 17, 0], [1, 23, 0]])
  .style({
    fill_color: '#08f',
    height: 3.6
  })
  .id('object-2')
`,
  polyline: `
  .primitive('/prediction/trajectory')
  .polyline([[10, 10, 0], [10, 12, 0], [12, 14, 0], [12, 16, 0], [14, 18, 0], [14, 20, 0]])
  .id('object-1')

  .polyline([[3, 18.5, 0], [-1, 17, 0], [-2, 17, 0], [-6, 15, 0]]) 
  .id('object-2')
  .style({stroke_width: 0.5})
`,
  points: `
  .primitive('/lidar/points')
  .points(new Array(200).fill(0).map(() => [7 + Math.random() * 6, 6 + Math.random() * 8, Math.random() * 3 ]))
  .points(new Array(200).fill(0).map(() => [-2 + Math.random() * 10, 14 + Math.random() * 9, Math.random() * 3.6 ]))
`,
  stadium: `
  .primitive('/motion_planning/vehicle')
  .stadium([3, 0, 0], [6, 0, 0])
  .stadium([9, 0, 0], [12, 0, 0], 2)
`,
  text: `
  .primitive('/object/label')
  .text('Object 01')
  .position([10, 10, 2])

  .text('Object 02')
  .position([3, 18.5, 4])
  .style({text_anchor: 'START', text_rotation: 90})
`
};

export function getCodeSample(streamNames) {
  let metadata = `// metadata
xvizMetadataBuilder
  .startTime(1000)
  .endTime(1005)

  .stream('/vehicle_pose')
  .category('POSE')
`;
  let frame = `// frame
const timestamp = 1000;

xvizBuilder
  .pose('/vehicle_pose')
  .timestamp(timestamp)
  .mapOrigin(-122.4, 37.8, 0)
  .orientation(0, 0, 0)
`;
  for (const streamName of streamNames) {
    if (streamName in streamMetadata) {
      metadata += streamMetadata[streamName];
      frame += `\nxvizBuilder${streamSample[streamName]}`;
    }
  }

  return {metadata, frame};
}
