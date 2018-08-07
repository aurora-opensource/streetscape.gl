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

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import {PathLayer} from '@deck.gl/layers';

function copyArray(target, targetOffset, source, sourceOffset, length) {
  for (let i = 0; i < length; i++) {
    target[targetOffset++] = source[sourceOffset + i];
  }
  return length;
}

const isClosed = path => {
  if (path instanceof Float32Array) {
    const lastIndex = path.length - 3;
    return (
      path[0] === path[lastIndex + 0] &&
      path[1] === path[lastIndex + 1] &&
      path[2] === path[lastIndex + 2]
    );
  }

  const firstPoint = path[0];
  const lastPoint = path[path.length - 1];
  return (
    firstPoint[0] === lastPoint[0] &&
    firstPoint[1] === lastPoint[1] &&
    firstPoint[2] === lastPoint[2]
  );
};

export default class BinaryPathLayer extends PathLayer {
  calculateStartPositions(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    let offset = 0;
    paths.forEach(path => {
      if (path instanceof Float32Array) {
        offset += copyArray(value, offset, path, 0, path.length - 3);
      } else {
        const numSegments = path.length - 1;
        for (let ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          const point = path[ptIndex];
          value[i++] = point[0];
          value[i++] = point[1];
          value[i++] = point[2] || 0;
        }
      }
    });
  }

  calculateEndPositions(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    let offset = 0;
    paths.forEach(path => {
      if (path instanceof Float32Array) {
        offset += copyArray(value, offset, path, 3, path.length - 3);
      } else {
        for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
          const point = path[ptIndex];
          value[i++] = point[0];
          value[i++] = point[1];
          value[i++] = point[2] || 0;
        }
      }
    });
  }

  calculateLeftDeltas(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    let offset = 0;
    paths.forEach(path => {
      if (path instanceof Float32Array) {
        let prevPointIndex = isClosed(path) ? path.length - 6 : 0;
        const numComponents = path.length - 3;
        for (let ptIndex = 0; ptIndex < numComponents; ptIndex += 3) {
          value[offset++] = path[ptIndex + 0] - path[prevPointIndex + 0];
          value[offset++] = path[ptIndex + 1] - path[prevPointIndex + 1];
          value[offset++] = path[ptIndex + 2] - path[prevPointIndex + 2];
          prevPointIndex = ptIndex;
        }
      } else {
        const numSegments = path.length - 1;
        let prevPoint = isClosed(path) ? path[path.length - 2] : path[0];

        for (let ptIndex = 0; ptIndex < numSegments; ptIndex++) {
          const point = path[ptIndex];
          value[i++] = point[0] - prevPoint[0];
          value[i++] = point[1] - prevPoint[1];
          value[i++] = point[2] - prevPoint[2] || 0;
          prevPoint = point;
        }
      }
    });
  }

  calculateRightDeltas(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach(path => {
      if (path instanceof Float32Array) {
        let offset = 0;
        for (let ptIndex = 3; ptIndex < path.length; ptIndex++) {
          let nextPointIndex = ptIndex + 3;
          if (nextPointIndex > path.length - 3) {
            nextPointIndex = isClosed(path) ? 3 : ptIndex;
          }

          value[offset++] = path[nextPointIndex + 0] - path[ptIndex + 0];
          value[offset++] = path[nextPointIndex + 1] - path[ptIndex + 1];
          value[offset++] = path[nextPointIndex + 2] - path[ptIndex + 2];
        }
      } else {
        for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
          const point = path[ptIndex];
          let nextPoint = path[ptIndex + 1];
          if (!nextPoint) {
            nextPoint = isClosed(path) ? path[1] : point;
          }

          value[i++] = nextPoint[0] - point[0];
          value[i++] = nextPoint[1] - point[1];
          value[i++] = nextPoint[2] - point[2] || 0;
        }
      }
    });
  }

  calculateStrokeWidths(attribute) {
    const {data, getWidth} = this.props;
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const width = getWidth(data[index], index);
      for (let ptIndex = 1; ptIndex < this._getPathLength(path); ptIndex++) {
        value[i++] = width;
      }
    });
  }

  calculateDashArrays(attribute) {
    const {data, getDashArray} = this.props;
    if (!getDashArray) {
      return;
    }

    const {paths} = this.state;
    const {value} = attribute;
    let i = 0;
    paths.forEach((path, index) => {
      const dashArray = getDashArray(data[index], index);
      for (let ptIndex = 1; ptIndex < this._getPathLength(path); ptIndex++) {
        value[i++] = dashArray[0];
        value[i++] = dashArray[1];
      }
    });
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const pointColor = getColor(data[index], index);
      if (isNaN(pointColor[3])) {
        pointColor[3] = 255;
      }
      for (let ptIndex = 1; ptIndex < this._getPathLength(path); ptIndex++) {
        value[i++] = pointColor[0];
        value[i++] = pointColor[1];
        value[i++] = pointColor[2];
        value[i++] = pointColor[3];
      }
    });
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const pickingColor = this.encodePickingColor(index);
      for (let ptIndex = 1; ptIndex < this._getPathLength(path); ptIndex++) {
        value[i++] = pickingColor[0];
        value[i++] = pickingColor[1];
        value[i++] = pickingColor[2];
      }
    });
  }

  _getPathLength(path) {
    return path instanceof Float32Array ? path.length / 3 : path.length;
  }
}

BinaryPathLayer.layerName = 'BinaryPathLayer';
