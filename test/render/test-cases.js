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
import {SignLayer, TrafficLightLayer, LaneLayer} from '@streetscape.gl/layers';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

export const WIDTH = 800;
export const HEIGHT = 450;

const signLayerProps = {
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: [-122.4, 37.8],

  coordinate: 'VEHICLE_RELATIVE',

  iconAtlas: './test/render/stop-sign.png',
  iconMapping: {
    stop: {x: 0, y: 0, width: 256, height: 256}
  },
  data: [
    {position: [-1, -1, 1], angle: 0},
    {position: [-1, 1, 1], angle: 90},
    {position: [1, 1, 1], angle: 180},
    {position: [1, -1, 1], angle: 270}
  ],

  getAngle: d => (d.angle / 180) * Math.PI,
  getIcon: d => 'stop',
  getSize: 1
};

export const TEST_CASES = [
  {
    name: 'sign-layer',
    viewState: {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 22.5,
      pitch: 60,
      bearing: 30
    },
    layers: [
      new SignLayer({
        ...signLayerProps,
        id: 'sign-3d',
        render3D: true,
        getPosition: d => d.position
      }),
      new SignLayer({
        ...signLayerProps,
        id: 'sign-2d',
        render3D: false,
        getPosition: d => [d.position[0], d.position[1], 0]
      })
    ],
    goldenImage: './test/render/golden-images/sign.png'
  },
  {
    name: 'traffic-light-layer',
    viewState: {
      longitude: -122.4,
      latitude: 37.8,
      zoom: 23,
      pitch: 75,
      bearing: -60
    },
    layers: [
      new TrafficLightLayer({
        id: 'traffic-lights',
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.4, 37.8],

        data: [
          {position: [0, 0, 1], angle: 0, color: 'red'},
          {position: [0, 0, 0.5], angle: -10, color: 'yellow'},
          {position: [0, 0, 0], angle: -20, color: 'green'},
          {position: [0, 0, -0.5], angle: -30, color: 'red', shape: 'left_arrow'},
          {position: [0, 0, -1], angle: -40, color: 'red', shape: 'right_arrow'}
        ],

        getPosition: d => d.position,
        getShape: d => d.shape || 'circular',
        getColor: d => d.color,
        getAngle: d => (d.angle / 180) * Math.PI,
        getState: 1
      })
    ],
    goldenImage: './test/render/golden-images/traffic-light.png'
  },
  {
    name: 'lane-layer',
    viewState: {
      longitude: -122.39995,
      latitude: 37.80001,
      zoom: 22,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new LaneLayer({
        id: 'lanes',
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: [-122.4, 37.8],

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
              [10, -1, 0]
            ]
          }
        ],

        highPrecisionDash: true,

        getPath: d => d.path,
        getColor: [80, 200, 0],
        getColor2: [0, 128, 255],
        getWidth: [0.1, 0.05, 0.05],
        getDashArray: [4, 1, 1, 1]
      })
    ],
    goldenImage: './test/render/golden-images/lanes.png'
  }
];
