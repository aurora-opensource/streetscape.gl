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

const carLayerFragment = `
#define SHADER_NAME mesh-layer-fs

#ifdef GL_ES
precision highp float;
#endif

uniform bool hasTexture;
uniform sampler2D sampler;
uniform float opacity;
uniform float desaturate;
uniform float brightness;

varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

// apply desaturation and brightness
vec3 color_transform(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333 + brightness;
  return mix(color, vec3(luminance), desaturate);
}

void main(void) {
  vec4 color = hasTexture ? texture2D(sampler, vTexCoord) : vColor / 255.;
  gl_FragColor = vec4(color_transform(color.rgb) * vLightWeight, color.a * opacity);
  
  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;

export default carLayerFragment;
