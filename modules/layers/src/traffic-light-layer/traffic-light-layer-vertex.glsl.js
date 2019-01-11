export default `\
#define SHADER_NAME traffic-light-layer-vs

uniform vec3 modelScale;
uniform vec3 modelTranslate;
uniform bool useInstanceColor;
uniform float opacity;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xyLow;
attribute float instanceAngles;
attribute float instanceShapes;
attribute vec3 instanceColors;
attribute float instanceStates;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec4 vColor;
varying vec2 vTexCoord;

// Used for geometry that does not have color
const vec4 defaultColor = vec4(0.05, 0.05, 0.05, 1.0);

void main(void) {
  float angle = instanceAngles;
  mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

  vec3 offset = (positions + modelTranslate) * modelScale;
  offset.xy = rotationMatrix * offset.xy;
  offset = project_scale(offset);
  vec3 normal = vec3(rotationMatrix * normals.xy, normals.z);

  vec4 position_worldspace;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xyLow, offset, position_worldspace);

  float envLight = lighting_getLightWeight(position_worldspace.xyz, normal);
  if (useInstanceColor) {
    float ownLight = instanceStates;
    vColor = vec4(instanceColors * max(ownLight, envLight * 0.2) / 255.0, opacity);
  } else {
    vColor = vec4(defaultColor.rgb * envLight, defaultColor.a * opacity);
  }

  vTexCoord = vec2((texCoords.y + instanceShapes) / 4.0, texCoords.x);

  picking_setPickingColor(instancePickingColors);
}
`;
