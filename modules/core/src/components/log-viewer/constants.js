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
import {CubeGeometry} from 'luma.gl';
import {COORDINATE_SYSTEM} from 'deck.gl';

export const DEFAULT_CAR = {
  mesh: new CubeGeometry(),
  origin: [0, 0, 0.7],
  color: [128, 128, 128],
  scale: [2, 1, 0.7]
};

export const DEFAULT_ORIGIN = [0, 0, 0];

export const CAR_DATA = [[0, 0, 0]];

export const LIGHT_SETTINGS = {
  coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
  coordinateOrigin: DEFAULT_ORIGIN,
  lightsPosition: [0, 0, 5000, -1000, 400, 1000],
  ambientRatio: 0.5,
  diffuseRatio: 0.2,
  specularRatio: 0.4,
  lightsStrength: [0.68, 0.0, 1.2, 0.0],
  numberOfLights: 2
};
