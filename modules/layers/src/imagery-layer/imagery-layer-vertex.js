export default `
#define SHADER_NAME imagery-layer-vertex-shader

attribute vec2 texCoords;

uniform bool hasHeightMap;
uniform sampler2D heightMapTexture;
uniform vec4 heightMapBounds;
uniform vec2 heightRange;
uniform vec4 imageryBounds;

varying vec2 vTexCoord;

// HACK/ib - Expose vWorldHeight to enable derivatives in fragment shader
varying float vWorldHeight;

vec2 getUV(vec4 bounds, vec2 coords) {
  return vec2(
    (coords.x - bounds[0]) / (bounds[2] - bounds[0]),
    (coords.y - bounds[1]) / (bounds[3] - bounds[1])
  );
}

void main(void) {
  // Calculate vertex position
  vec2 position = vec2(
    mix(imageryBounds[0], imageryBounds[2], texCoords.x),
    mix(imageryBounds[1], imageryBounds[3], texCoords.y)
  );

  float z = 0.0;
  // Handle heightMap if provided
  if (hasHeightMap) {
    vec4 heightMapColor = texture2D(heightMapTexture, getUV(heightMapBounds, position));
    float relativeHeight = heightMapColor.b;
    z = mix(heightRange[0], heightRange[1], relativeHeight);
  }
  vec3 vertex = project_position(vec3(position, z));

  vWorldHeight = z;
  vTexCoord = texCoords;

  // Apply projection matrix
  gl_Position = project_to_clipspace(vec4(vertex, 1.0));

  picking_setPickingColor(vec3(0., 0., 1.));
}
`;
