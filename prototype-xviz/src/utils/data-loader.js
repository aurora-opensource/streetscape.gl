import * as d3 from 'd3-fetch';
import OBJ from 'webgl-obj-loader';
import {streamLog, LOG_STREAM_MESSAGE} from '@uber/xviz';
import {experimental} from 'math.gl';
const {Pose} = experimental;

import './xviz-config';

export function loadOBJMesh(url) {
  return d3.text(url)
    .then(text => {
      const mesh = new OBJ.Mesh(text);
      const indices = new Uint16Array(mesh.indices);
      const positions = new Float32Array(mesh.vertices);
      const normals = new Float32Array(mesh.vertexNormals);
      const texCoords = new Float32Array(mesh.textures);
      return {indices, positions, normals, texCoords};
    });
}

export function openLogStream({
  onMetadata,
  onUpdate
}) {
  return streamLog({
    logGuid: 'mock',
    serverConfig: {
      serverUrl: 'ws://localhost:8081'
    },
    onOpen: () => console.log('Connected to xviz stream server'),
    onMessage: msg => {
      switch (msg.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        return onMetadata(msg);

      case LOG_STREAM_MESSAGE.TIMESLICE:
        return onUpdate(msg);

      default:
        return console.warn(msg);
      }
    },
    onError: console.error
  });
}
