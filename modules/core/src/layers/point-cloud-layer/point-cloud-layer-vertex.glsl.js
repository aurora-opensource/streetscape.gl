// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
#define SHADER_NAME point-cloud-layer-vertex-shader

attribute vec3 positions;
attribute vec4 instanceColors;
attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float radiusPixels;
uniform float colorMode;
uniform vec2 colorDomain;
uniform mat4 vehicleDistanceTransform;

varying vec4 vColor;
varying vec2 unitPosition;

const float COLOR_MODE_INLINE = 0.0;
const float COLOR_MODE_Z = 1.0;
const float COLOR_MODE_DISTANCE = 2.0;
const float ONE_THIRD = 1.0 / 3.0;
const float TWO_THIRD = 2.0 / 3.0;
const float ONE_SIXTH = 1.0 / 6.0;

// http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
// s = 1.0, l = 0.5
float hue(float t) {
  t = t + step(t, 0.0) - step(1.0, t);
  if (t < ONE_SIXTH) return 6.0 * t;
  if (t < 0.5) return 1.0;
  if (t < TWO_THIRD) return 4.0 - t * 6.0;
  return 0.0;
}

vec3 distToRgb(float dist) {
  float h = (dist - colorDomain.x) / (colorDomain.y - colorDomain.x);
  h = clamp(h, 0.0, 1.0);
  h = mix(0.5, 0.0, h);

  return vec3(
    hue(h + ONE_THIRD),
    hue(h),
    hue(h - ONE_THIRD)
  );
}

void main(void) {
  geometry.worldPosition = instancePositions;

  // position on the containing square in [-1, 1] space
  unitPosition = positions.xy;
  geometry.uv = unitPosition;
  geometry.pickingColor = instancePickingColors;

  // Find the center of the point and add the current vertex
  vec3 offset = vec3(positions.xy * radiusPixels, 0.0);
  DECKGL_FILTER_SIZE(offset, geometry);

  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.), geometry.position);
  gl_Position.xy += project_pixel_size_to_clipspace(offset.xy) * project_uFocalDistance;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vec4 colorPosition;
  if (colorMode == COLOR_MODE_DISTANCE) {
    colorPosition = vehicleDistanceTransform * vec4(instancePositions, 1.0);
    vColor = vec4(distToRgb(length(colorPosition.xyz)), opacity);
  } else if (colorMode == COLOR_MODE_Z) {
    colorPosition = project_uModelMatrix * vec4(instancePositions, 1.0);
    vColor = vec4(distToRgb(colorPosition.z), opacity);
  } else {
    vColor = vec4(instanceColors.rgb, instanceColors.a * opacity);
  }

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
