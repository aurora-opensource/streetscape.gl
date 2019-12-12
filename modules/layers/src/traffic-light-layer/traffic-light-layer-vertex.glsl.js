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
#define SHADER_NAME traffic-light-layer-vs

uniform vec3 modelScale;
uniform vec3 modelTranslate;
uniform bool useInstanceColor;
uniform float opacity;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute float instanceAngles;
attribute float instanceShapes;
attribute vec3 instanceColors;
attribute float instanceStates;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec4 vColor;
varying vec2 vTexCoord;

// Used for geometry that does not have color
const vec4 defaultColor = vec4(0.05, 0.05, 0.05, 1.0);

void main(void) {
  float angle = instanceAngles + PI;
  mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

  vec3 offset = (positions + modelTranslate) * modelScale;
  offset.xy = rotationMatrix * offset.xy;
  offset = project_size(offset);
  vec3 normal_commonspace = project_normal(vec3(rotationMatrix * normals.xy, normals.z));

  vec4 position_commonpace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, position_commonpace);

  if (useInstanceColor) {
    float ownLight = instanceStates;
    vColor = vec4(instanceColors.rgb * ownLight / 255.0, opacity);
  } else {
    vColor = vec4(defaultColor.rgb, defaultColor.a * opacity);
  }
  vColor.rgb = lighting_getLightColor(vColor.rgb, project_uCameraPosition, position_commonpace.xyz, normal_commonspace);

  vTexCoord = vec2((1.0 - texCoords.y + instanceShapes) / 4.0, texCoords.x);

  picking_setPickingColor(instancePickingColors);
}
`;
