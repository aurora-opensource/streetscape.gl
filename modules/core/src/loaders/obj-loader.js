import OBJ from 'webgl-obj-loader';
import * as d3 from 'd3-fetch';

export function loadOBJMesh(url) {
  return d3.text(url).then(text => {
    const mesh = new OBJ.Mesh(text);
    const indices = new Uint16Array(mesh.indices);
    const positions = new Float32Array(mesh.vertices);
    const normals = new Float32Array(mesh.vertexNormals);
    const texCoords = new Float32Array(mesh.textures);
    return {indices, positions, normals, texCoords};
  });
}
