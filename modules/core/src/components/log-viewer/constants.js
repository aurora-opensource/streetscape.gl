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
import {CubeGeometry} from '@luma.gl/core';
import {LightingEffect, AmbientLight, DirectionalLight} from '@deck.gl/core';

export const DEFAULT_CAR = {
  mesh: new CubeGeometry(),
  origin: [0, 0, 0.7],
  color: [128, 128, 128],
  scale: [2, 1, 0.7]
};

export const DEFAULT_ORIGIN = [0, 0, 0];

export const CAR_DATA = [[0, 0, 0]];

export const LIGHTS = new LightingEffect({
  ambient: new AmbientLight({color: [255, 255, 255], intensity: 2.0}),
  dir1: new DirectionalLight({color: [255, 255, 255], intensity: 1.0, direction: [-1, -3, -1]}),
  dir2: new DirectionalLight({color: [255, 255, 255], intensity: 0.5, direction: [1, 8, -2.5]})
});
