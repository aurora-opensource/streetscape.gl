export default `\
#define SHADER_NAME traffic-light-layer-vs

uniform vec3 modelScale;
uniform vec3 modelTranslate;
uniform float useInstanceColor;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute float instanceAngles;
attribute float instanceShapes;
attribute vec3 instanceColors;
attribute float instanceStates;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec4 vColor;
varying vec2 vTexCoord;

// Used for geometry that does not have color
const vec4 defaultColor = vec4(0.05, 0.05, 0.05, 0.8);

void main(void) {
  float angle = instanceAngles + PI;
  mat2 rotationMatrix = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
  vec3 position_modelspace = positions * modelScale + modelTranslate;
  position_modelspace = instancePositions + vec3(rotationMatrix * position_modelspace.xy, position_modelspace.z);
  vec3 normal_modelspace = vec3(rotationMatrix * normals.xy, normals.z);

  vec4 position_worldspace = vec4(project_position(position_modelspace), 1.0);
  gl_Position = project_to_clipspace(position_worldspace);

  float envLight = lighting_getLightWeight(position_worldspace.xyz, normal_modelspace);
  float ownLight = instanceStates;
  vec4 objectColor = vec4(instanceColors * max(ownLight, envLight * 0.2) / 255.0, 1.0);

  vColor = mix(defaultColor, objectColor, useInstanceColor);
  vTexCoord = vec2((texCoords.y + instanceShapes) / 4.0, texCoords.x);

  picking_setPickingColor(instancePickingColors);
}
`;
