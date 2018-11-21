/* global fetch */
import OBJ from 'webgl-obj-loader';

export function loadOBJMesh(url) {
  return fetch(url)
    .then(resp => resp.text())
    .then(text => {
      const mesh = new OBJ.Mesh(text);
      const indices = new Uint16Array(mesh.indices);
      const positions = new Float32Array(mesh.vertices);
      const normals = new Float32Array(mesh.vertexNormals);
      const texCoords = new Float32Array(mesh.textures);
      return {indices, positions, normals, texCoords};
    });
}
