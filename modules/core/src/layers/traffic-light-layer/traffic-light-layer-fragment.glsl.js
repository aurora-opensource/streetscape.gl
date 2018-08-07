export default `
#define SHADER_NAME traffic-light-layer-fs

#ifdef GL_ES
precision highp float;
#endif

uniform float useInstanceColor;
uniform sampler2D lightShapeTexture;

varying vec4 vColor;
varying vec4 vPickingColor;
varying vec2 vTexCoord;

void main(void) {

  vec4 mask = texture2D(lightShapeTexture, vTexCoord);
  vec4 color = vec4(vColor.rgb * mask.rgb, vColor.a);
  color = mix(vColor, color, useInstanceColor);

  gl_FragColor = color;

  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
