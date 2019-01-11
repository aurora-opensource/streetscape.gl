export default `
#extension GL_OES_standard_derivatives : enable
#define SHADER_NAME imagery-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D imageryTexture;

varying vec2 vTexCoord;

// TODO/ib enables shader derivatives that facilitate debugging height maps
varying float vWorldHeight;
const float SLOPE_MAX = 0.10;

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
  vec4 bitmapColor = texture2D(imageryTexture, vTexCoord);

  // TODO/ib - discard fragments when height is changing to quickly
  // Uncomment to debug height maps
  // If changing more than 5 centimeter per pixel discard
  // if (abs(dFdx(vWorldHeight)) > SLOPE_MAX || abs(dFdy(vWorldHeight)) > SLOPE_MAX) {
  //   discard;
  // }

  if (bitmapColor.rgb == vec3(0., 0., 0.)) {
    discard;
  };

  gl_FragColor = apply_opacity(color_tint(color_desaturate(bitmapColor.rgb)), bitmapColor.a * opacity);

  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
