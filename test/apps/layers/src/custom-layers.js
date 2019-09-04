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
import {SignLayer, TrafficLightLayer, ImageryLayer, LaneLayer} from '@streetscape.gl/layers';

const signLayerProps = {
  coordinate: 'VEHICLE_RELATIVE',

  iconAtlas:
    'https://raw.githubusercontent.com/uber/deck.gl/master/examples/layer-browser/data/icon-atlas.png',
  iconMapping:
    'https://raw.githubusercontent.com/uber/deck.gl/master/examples/layer-browser/data/icon-atlas.json',
  data: [
    {position: [0, 4, 1], angle: 0},
    {position: [0, 6, 1], angle: Math.PI / 2},
    {position: [0, 8, 1], angle: Math.PI},
    {position: [0, 10, 1], angle: (Math.PI * 3) / 2}
  ],

  getPosition: d => d.position,
  getAngle: d => d.angle,
  getIcon: d => 'marker-warning',
  getSize: 1
};

export default [
  new SignLayer({
    ...signLayerProps,
    id: 'sign-layer-3d',
    render3D: true
  }),
  new SignLayer({
    ...signLayerProps,
    id: 'sign-layer-2d',
    render3D: false
  }),

  new TrafficLightLayer({
    id: 'traffic-lights',
    coordinate: 'VEHICLE_RELATIVE',

    data: [
      {position: [20, 0, 4], color: 'red'},
      {position: [20, 0, 3.5], color: 'yellow'},
      {position: [20, 0, 3], color: 'green'},
      {position: [20, 0, 2.5], color: 'red', shape: 'left_arrow'},
      {position: [20, 0, 2], color: 'red', shape: 'right_arrow'}
    ],

    getPosition: d => d.position,
    getShape: d => d.shape || 'circular',
    getColor: d => d.color,
    getAngle: 0,
    getState: 1
  }),

  new ImageryLayer({
    id: 'ground-imagery',
    coordinate: 'VEHICLE_RELATIVE',

    imagery:
      'https://raw.githubusercontent.com/uber/deck.gl/master/examples/layer-browser/data/texture.png',
    imageryBounds: [0, 0, 10, 10],
    uCount: 2,
    vCount: 2,
    transparentColor: [255, 255, 255, 0]
  }),

  new LaneLayer({
    id: 'lanes',
    coordinate: 'VEHICLE_RELATIVE',

    data: [
      {
        path: [
          [0, 0, 0],
          [2, 1, 0],
          [3, 3, 0],
          [3.05, 3, 0],
          [3.05, 3.05, 0],
          [3.1, 3.05, 0],
          [3.1, 3.1, 0],
          [3.15, 3.1, 0],
          [3.15, 3.15, 0],
          [3.2, 3.15, 0],
          [3.2, 3.2, 0],
          [5, 4, 0],
          [7, 2.4, 0],
          [7, 0, 0],
          [10, 0, 0]
        ]
      }
    ],

    highPrecisionDash: true,

    getPath: d => d.path,
    getColor: [80, 200, 0],
    getColor2: [0, 128, 255],
    getWidth: [0.1, 0.05, 0.1],
    getDashArray: [4, 1, 1, 1]
  })
];
