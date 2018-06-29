const carLayerFragment = `
#define SHADER_NAME mesh-layer-fs

#ifdef GL_ES
precision highp float;
#endif

// uniform bool hasTexture1;
uniform sampler2D sampler1;
uniform float opacity;
uniform float desaturate;
uniform float brightness;

varying vec2 vTexCoord;
varying float vLightWeight;

// apply desaturation and brightness
vec3 color_transform(vec3 color) {
  float luminance = (color.r + color.g + color.b) * 0.333333333 + brightness;
  return mix(color, vec3(luminance), desaturate);
}

void main(void) {
  vec4 color = texture2D(sampler1, vTexCoord);
  color = vec4(color_transform(color.rgb), color.a * opacity);
  gl_FragColor = color * vLightWeight;
  
  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;

export default carLayerFragment;
