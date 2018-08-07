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

export default `
#define SHADER_NAME bitmap-layer-vertex-shader

attribute vec3 positions;
attribute vec2 texCoords;

attribute vec4 instancePositions;
attribute vec2 instanceAngle;
attribute float instanceBitmapType;
attribute vec3 instancePickingColors;

uniform vec2 imageSize;
uniform float renderPickingBuffer;
uniform float layerIndex;
uniform float flipY;

varying vec2 vTexCoord;
varying float vBitmapType;
varying vec4 vPickingColor;

void main(void) {
  vec2 offset = instancePositions.wz;
  vec2 flipTransform = vec2(1.0, 1.0 - flipY * 2.0);
  vec2 cornerPosition = instancePositions.xy + flipTransform * positions.xy * imageSize;

  // Rotate and scale primitive vertex
  // float angle = instanceAngle.x;
  // mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  // Calculate vertex position
  vec2 vertex = project_position(cornerPosition);

  // Apply projection matrix
  gl_Position = project_to_clipspace(vec4(vertex, 0.0, 1.0));

  vTexCoord = texCoords;
  vBitmapType = instanceBitmapType;

  vPickingColor = vec4(instancePickingColors / 255.0, 1.);
}
`;
