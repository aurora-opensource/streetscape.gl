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
import {SignLayer, TrafficLightLayer, ImageryLayer} from '@streetscape.gl/layers';

export default [
  new SignLayer({
    id: 'sign-layer',
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
  })
];
