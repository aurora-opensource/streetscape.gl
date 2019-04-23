// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import GL from '@luma.gl/constants';
import {Geometry} from '@luma.gl/core';

export default class GridGeometry extends Geometry {
  constructor({
    id = uid('grid-geometry'),
    uCount = 2,
    vCount = 2,
    drawMode = GL.TRIANGLES,
    ...opts
  } = {}) {
    super(
      Object.assign({}, opts, {
        id,
        drawMode,
        attributes: {
          indices: calculateIndices({uCount, vCount}),
          texCoords: calculateTexCoords({uCount, vCount})
        }
      })
    );
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
