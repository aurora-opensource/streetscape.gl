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

import {load} from '@loaders.gl/core';
import {OBJLoader} from '@loaders.gl/obj';

/* eslint-disable camelcase */
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const MAP_STYLE = 'mapbox://styles/uberdata/cjfxhlikmaj1b2soyzevnywgs';

// OBJ model width 2073mm, length 4946mm
// Volkswagen Passat: width 1820mm, length 4780mm
export const CAR = {
  mesh: load('./assets/car.obj', OBJLoader),
  origin: [1.08, -0.32, 0],
  scale: 0.0009,
  wireframe: true,
  color: [160, 160, 160]
};

export const SETTINGS = {
  viewMode: {
    type: 'select',
    title: 'View Mode',
    data: {TOP_DOWN: 'Top Down', PERSPECTIVE: 'Perspective', DRIVER: 'Driver'}
  }
};

// LOG_DIR is defined in webpack.config.js
/* eslint-disable no-undef */
export const LOGS = [
  {
    name: 'KITTI-0005',
    path: `${LOG_DIR}/kitti/2011_09_26_drive_0005_sync`,
    xvizConfig: {
      TIME_WINDOW: 0.4
    },
    videoAspectRatio: 10 / 3
  },
  {
    name: 'nuTonomy-0006',
    path: `${LOG_DIR}/nutonomy/scene-0006`,
    xvizConfig: {
      TIME_WINDOW: 0.2,
      PLAYBACK_FRAME_RATE: 16
    },
    videoAspectRatio: 16 / 9
  }
];

export const MOBILE_NOTIFICATION = {
  id: 'mobile',
  message: 'Streetscape.gl demo can not run on mobile devices.'
};
