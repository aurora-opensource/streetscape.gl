import GL from 'luma.gl/constants';
import {Geometry} from 'luma.gl';

export default class GridGeometry extends Geometry {
  constructor({
    id = uid('grid-geometry'),
    uCount = 2,
    vCount = 2,
    drawMode = GL.TRIANGLES,
    ...opts
  } = {}) {
    super(Object.assign({}, opts, {
      id,
      drawMode,
      attributes: {
        indices: calculateIndices({uCount, vCount}),
        texCoords: calculateTexCoords({uCount, vCount})
      }
    }));
  }
}

const uidCounters = {};

/**
 * Returns a UID.
 * @param {String} id= - Identifier base name
 * @return {number} uid
 **/
function uid(id = 'id') {
  uidCounters[id] = uidCounters[id] || 1;
  const count = uidCounters[id]++;
  return `${id}-${count}`;
}

function calculateIndices({uCount, vCount}) {
  // # of squares = (nx - 1) * (ny - 1)
  // # of triangles = squares * 2
  // # of indices = triangles * 3
  const indicesCount = (uCount - 1) * (vCount - 1) * 2 * 3;
  const indices = new Uint32Array(indicesCount);

  let i = 0;
  for (let uIndex = 0; uIndex < uCount - 1; uIndex++) {
    for (let vIndex = 0; vIndex < vCount - 1; vIndex++) {
      /*
       *   i0   i1
       *    +--.+---
       *    | / |
       *    +'--+---
       *    |   |
       *   i2   i3
       */
      const i0 = vIndex * uCount + uIndex;
      const i1 = i0 + 1;
      const i2 = i0 + uCount;
      const i3 = i2 + 1;

      indices[i++] = i0;
      indices[i++] = i2;
      indices[i++] = i1;
      indices[i++] = i1;
      indices[i++] = i2;
      indices[i++] = i3;
    }
  }

  return indices;
}

function calculateTexCoords({uCount, vCount}) {
  const texCoords = new Float32Array(uCount * vCount * 2);

  let i = 0;
  for (let vIndex = 0; vIndex < vCount; vIndex++) {
    for (let uIndex = 0; uIndex < uCount; uIndex++) {
      texCoords[i++] = uIndex / (uCount - 1);
      texCoords[i++] = vIndex / (vCount - 1);
    }
  }

  return {value: texCoords, size: 2};
}
