export default `
#define SHADER_NAME traffic-light-layer-fs

#ifdef GL_ES
precision highp float;
#endif

uniform bool useInstanceColor;
uniform sampler2D lightShapeTexture;

varying vec4 vColor;
varying vec4 vPickingColor;
varying vec2 vTexCoord;

void main(void) {
  if (useInstanceColor) {
    vec4 mask = texture2D(lightShapeTexture, vTexCoord);
    gl_FragColor = vec4(vColor.rgb * mask.rgb, vColor.a);
  } else {
    gl_FragColor = vColor;
  }
    gl_FragColor = vColor;

  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
