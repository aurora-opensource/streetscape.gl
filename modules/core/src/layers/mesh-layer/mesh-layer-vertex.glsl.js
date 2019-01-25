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
#define SHADER_NAME mesh-layer-vs

// Scale the model
uniform float sizeScale;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xy;
attribute vec3 instanceRotations;
attribute vec3 instanceSizes;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

// yaw(z) pitch(y) roll(x)
mat3 getRotationMatrix(vec3 rotation) {
  float sr = sin(rotation.x);
  float sp = sin(rotation.y);
  float sw = sin(rotation.z);

  float cr = cos(rotation.x);
  float cp = cos(rotation.y);
  float cw = cos(rotation.z);

  return mat3(
    cw * cp,                  // 0,0
    sw * cp,                  // 1,0
    -sp,                      // 2,0
    -sw * cr + cw * sp * sr,  // 0,1
    cw * cr + sw * sp * sr,   // 1,1
    cp * sr,                  // 2,1
    sw * sr + cw * sp * cr,   // 0,2
    -cw * sr + sw * sp * cr,  // 1,2
    cp * cr                   // 2,2
  );
}

void main(void) {
  mat3 rotationMatrix = getRotationMatrix(instanceRotations);

  vec3 pos = positions * instanceSizes * sizeScale;
  pos = rotationMatrix * pos;
  pos = (project_uModelMatrix * vec4(pos, 0.0)).xyz;
  pos = project_scale(pos);

  vec4 worldPosition;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);

  vec3 normal = rotationMatrix * normals;
  normal = project_normal(normal);

  picking_setPickingColor(instancePickingColors);

  vTexCoord = texCoords;
  vColor = instanceColors / 255.;
  vLightWeight = lighting_getLightWeight(worldPosition.xyz, normal);
}
`;
