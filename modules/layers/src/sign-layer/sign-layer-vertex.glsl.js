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

export default `\
#define SHADER_NAME sign-layer-vertex-shader

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute float instanceAngles;
attribute float instanceSizes;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceIconFrames;
attribute float instanceColorModes;
attribute vec2 instanceOffsets;

uniform float sizeScale;
uniform vec2 iconsTextureDim;
uniform float render3D;

varying vec4 vColor;
varying vec2 vTextureCoords;

void main(void) {
  // rotation
  float angle = instanceAngles + PI / 2.0;
  mat2 rotationMatrix = mat2(
    cos(angle), sin(angle),
    -sin(angle), cos(angle)
  );

  vec2 iconSize = instanceIconFrames.zw;
  vec2 texCoords = positions.xy;
  vec2 vertex_offset = (texCoords / 2.0 + instanceOffsets / iconSize) * sizeScale * instanceSizes;
  vec3 vertex = vec3(
    vertex_offset.x,
    vertex_offset.y * (render3D - 1.0),
    -vertex_offset.y * render3D
  );

  vec3 offset = project_size(vec3(rotationMatrix * vertex.xy, vertex.z));
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset);

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (texCoords + 1.0) / 2.0
  ) / iconsTextureDim;

  vColor = instanceColors;

  picking_setPickingColor(instancePickingColors);
}
`;
