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
#define SHADER_NAME sign-layer-fragment-shader

precision highp float;

uniform float render3D;
uniform float opacity;
uniform sampler2D iconsTexture;

varying vec4 vColor;
varying vec2 vTextureCoords;

const float MIN_ALPHA = 0.05;

void main(void) {
  vec4 texColor = texture2D(iconsTexture, vTextureCoords);

  // front of the sign, uses pixel color from the texture
  // back of the sign uses texture as transparency mask
  vec3 color = render3D < 0.5 || gl_FrontFacing ? texColor.rgb : vColor.rgb;
  float a = texColor.a * opacity;

  if (a < MIN_ALPHA) {
    discard;
  }

  gl_FragColor = vec4(color, a);

  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
