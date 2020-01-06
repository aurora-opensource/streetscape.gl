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
#define SHADER_NAME imagery-layer-vertex-shader

attribute vec2 texCoords;

uniform bool hasHeightMap;
uniform sampler2D heightMapTexture;
uniform vec4 heightMapBounds;
uniform vec2 heightRange;
uniform vec4 imageryBounds;

varying vec2 vTexCoord;

// HACK/ib - Expose vWorldHeight to enable derivatives in fragment shader
varying float vWorldHeight;

vec2 getUV(vec4 bounds, vec2 coords) {
  return vec2(
    (coords.x - bounds[0]) / (bounds[2] - bounds[0]),
    (coords.y - bounds[1]) / (bounds[3] - bounds[1])
  );
}

void main(void) {
  // Calculate vertex position
  vec2 position = vec2(
    mix(imageryBounds[0], imageryBounds[2], texCoords.x),
    mix(imageryBounds[1], imageryBounds[3], texCoords.y)
  );

  float z = 0.0;
  // Handle heightMap if provided
  if (hasHeightMap) {
    vec4 heightMapColor = texture2D(heightMapTexture, getUV(heightMapBounds, position));
    float relativeHeight = heightMapColor.b;
    z = mix(heightRange[0], heightRange[1], relativeHeight);
  }

  vWorldHeight = z;
  vTexCoord = texCoords;

  gl_Position = project_position_to_clipspace(vec3(position, z), vec3(0.0), vec3(0.0));

  picking_setPickingColor(vec3(0., 0., 1.));
}
`;
