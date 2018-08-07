export default `
#define SHADER_NAME mesh-layer-vs

// Scale the model to meters
uniform float meterScale;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute float instanceAngles;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying float vLightWeight;

void main(void) {
  float angle = instanceAngles;
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec3 rotatedPosition = vec3(rotationMatrix * positions.xy, positions.z);

  vec3 p = project_position(instancePositions + rotatedPosition * meterScale);

  gl_Position = project_to_clipspace(vec4(p, 1.0));

  vTexCoord = texCoords;
  vLightWeight = lighting_getLightWeight(p, normals);

  picking_setPickingColor(instancePickingColors);
}
`;
