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

// Return a 1m x 1m x 1m cube
/* eslint-disable max-length */
function getDefaultCarMesh() {
  // prettier-ignore
  return {
    indices: new Uint16Array([0,1,2,2,3,0,0,3,4,5,6,7,7,8,5,9,10,5,8,11,5,11,9,5,12,13,14,14,15,12,16,12,15,17,18,19,19,20,17,17,20,21,22,23,24,25,26,23,26,25,27,25,28,27,22,25,23,29,30,31,31,32,29,33,29,32,34,35,36,36,37,34,38,34,37,37,39,38,40,41,42,42,43,40,44,40,43,43,45,44,46,47,48,48,49,46,50,46,49,49,51,50,52,53,54,54,55,52,56,52,55,55,57,56,58,59,60,60,61,58,62,58,61,61,63,62,64,65,66,66,67,64,68,64,67,67,69,68,70,71,72,73,74,75,74,71,75,76,70,72,77,70,78,79,75,77,77,75,71,70,77,71]),
    positions: new Float32Array([-0.5,0.434,0.612,-0.5,0.434,0.192,-0.44,0.5,0.192,-0.44,0.5,0.655,-0.44,0.5,1,-0.44,0.5,0.655,-0.44,0.5,0.192,0.25,0.5,0.192,0.25,0.5,0.452,0.1,0.5,1,-0.44,0.5,1,0.25,0.5,0.724,0.25,0.5,0.452,0.25,0.5,0.192,0.5,0.425,0.192,0.5,0.425,0.583,0.25,0.5,0.724,0.5,-0.425,0.583,0.5,-0.425,0.192,0.25,-0.5,0.192,0.25,-0.5,0.452,0.25,-0.5,0.724,-0.44,-0.5,0.192,0.25,-0.5,0.452,0.25,-0.5,0.192,-0.44,-0.5,0.655,0.25,-0.5,0.724,0.1,-0.5,1,-0.44,-0.5,1,-0.44,-0.5,0.655,-0.44,-0.5,0.192,-0.5,-0.434,0.192,-0.5,-0.434,0.612,-0.44,-0.5,1,0.5,0.04,0.192,0.5,-0.425,0.192,0.5,-0.425,0.583,0.5,0.04,0.583,0.5,0.425,0.192,0.5,0.425,0.583,0.5,0.04,0.583,0.5,-0.425,0.583,0.25,-0.5,0.724,0.25,0.04,0.724,0.5,0.425,0.583,0.25,0.5,0.724,0.25,0.04,0.724,0.25,-0.5,0.724,0.1,-0.5,1,0.1,0.04,1,0.25,0.5,0.724,0.1,0.5,1,0.1,0.04,1,0.1,-0.5,1,-0.44,-0.5,1,-0.44,0.04,1,0.1,0.5,1,-0.44,0.5,1,-0.44,0.04,1,-0.44,-0.5,1,-0.5,-0.434,0.612,-0.5,0.04,0.612,-0.44,0.5,1,-0.5,0.434,0.612,-0.5,0.04,0.612,-0.5,-0.434,0.612,-0.5,-0.434,0.192,-0.5,0.04,0.192,-0.5,0.434,0.612,-0.5,0.434,0.192,0.25,-0.5,0.192,-0.5,0.04,0.192,-0.5,-0.434,0.192,-0.44,0.5,0.192,-0.5,0.434,0.192,0.25,0.5,0.192,-0.44,-0.5,0.192,0.5,0.04,0.192,0.5,-0.425,0.192,0.5,0.425,0.192]),
    normals: new Float32Array([-0.762,0.647,0,-0.762,0.647,0,-0.707,0.707,0,-0.707,0.707,0,-0.707,0.707,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0.274,0.961,0,0.274,0.961,0,0.343,0.939,0,0.343,0.939,0,0.274,0.961,0,0.343,-0.939,0,0.343,-0.939,0,0.274,-0.961,0,0.274,-0.961,0,0.274,-0.961,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,-0.707,-0.707,0,-0.707,-0.707,0,-0.762,-0.647,0,-0.762,-0.647,0,-0.707,-0.707,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0.382,0,0.924,0.382,0,0.924,0.357,0,0.933,0.357,0,0.933,0.382,0,0.924,0.357,0,0.933,0.928,0,0.371,0.928,0,0.371,0.682,0,0.731,0.682,0,0.731,0.928,0,0.371,0.682,0,0.731,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,-0.948,0,0.316,-0.948,0,0.316,-0.993,0,0.115,-0.993,0,0.115,-0.948,0,0.316,-0.993,0,0.115,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1])
  };
}
/* eslint-enable max-length */

export const DEFAULT_ORIGIN = [0, 0, 0];

export const CAR_DATA = [[0, 0, 0]];

export const LIGHT_SETTINGS = {
  lightsPosition: [0, 0, 5000, -100, 40, 1000],
  ambientRatio: 0.5,
  diffuseRatio: 0.2,
  specularRatio: 0.4,
  lightsStrength: [1.0, 0.0, 1.0, 0.0],
  numberOfLights: 2
};

export const DEFAULT_CAR = {
  mesh: getDefaultCarMesh(),
  texture: null,
  wireframe: false,
  scale: [4, 1.8, 1.5],
  origin: [0, 0, 0]
};
