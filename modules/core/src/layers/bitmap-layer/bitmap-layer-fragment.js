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
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uBitmap0;
uniform sampler2D uBitmap1;
uniform sampler2D uBitmap2;
uniform sampler2D uBitmap3;
uniform sampler2D uBitmap4;
uniform sampler2D uBitmap5;
uniform sampler2D uBitmap6;
uniform sampler2D uBitmap7;
uniform sampler2D uBitmap8;
uniform sampler2D uBitmap9;
uniform sampler2D uBitmap10;

uniform float renderPickingBuffer;

varying vec2 vTexCoord;
varying float vBitmapType;
varying vec4 vPickingColor;

uniform float desaturate;
uniform vec4 transparentColor;
uniform vec3 tintColor;
uniform float opacity;

// apply desaturation
vec3 color_desaturate(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333;
  return mix(color, vec3(luminance), desaturate);
}

// apply tint
vec3 color_tint(vec3 color) {
  return color * tintColor / 255.0;
}

// blend with background color
vec4 apply_opacity(vec3 color, float alpha) {
  return mix(transparentColor / 255.0, vec4(color, 1.0), alpha);
}

void main(void) {
  vec4 bitmapColor;

  if (vBitmapType == float(1)) {
    bitmapColor = texture2D(uBitmap1, vTexCoord);
  } else if (vBitmapType == float(2)) {
    bitmapColor = texture2D(uBitmap2, vTexCoord);
  } else if (vBitmapType == float(3)) {
    bitmapColor = texture2D(uBitmap3, vTexCoord);
  } else if (vBitmapType == float(4)) {
    bitmapColor = texture2D(uBitmap4, vTexCoord);
  } else if (vBitmapType == float(5)) {
    bitmapColor = texture2D(uBitmap5, vTexCoord);
  } else if (vBitmapType == float(6)) {
    bitmapColor = texture2D(uBitmap6, vTexCoord);
  } else if (vBitmapType == float(7)) {
    bitmapColor = texture2D(uBitmap7, vTexCoord);
  } else if (vBitmapType == float(8)) {
    bitmapColor = texture2D(uBitmap8, vTexCoord);
  } else if (vBitmapType == float(9)) {
    bitmapColor = texture2D(uBitmap9, vTexCoord);
  } else if (vBitmapType == float(10)) {
    bitmapColor = texture2D(uBitmap10, vTexCoord);
  } else {
    bitmapColor = texture2D(uBitmap0, vTexCoord);
  }

  if (bitmapColor == vec4(0., 0., 0., 1.)) {
    discard;
  }

  gl_FragColor = mix(
    apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * opacity),
    vPickingColor,
    renderPickingBuffer
  );
}
`;
