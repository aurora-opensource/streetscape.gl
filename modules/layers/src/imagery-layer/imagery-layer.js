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

import {Layer} from '@deck.gl/core';
import {Model, Geometry, Texture2D} from '@luma.gl/core';
import {loadImage} from '@loaders.gl/core';

import IMAGERY_VERTEX_SHADER from './imagery-layer-vertex';
import IMAGERY_FRAGMENT_SHADER from './imagery-layer-fragment';

import GridGeometry from './grid-geometry';

/*
 * Load image data into luma.gl Texture2D objects
 * @param {WebGLContext} gl
 * @param {String|Texture2D|HTMLImageElement|Uint8ClampedArray} src - source of image data
 *   can be url string, Texture2D object, HTMLImageElement or pixel array
 * @returns {Promise} resolves to an object with name -> texture mapping
 */
function getTexture(gl, src, opts) {
  if (typeof src === 'string') {
    // Url, load the image
    return loadImage(src)
      .then(data => new Texture2D(gl, {data, ...opts}))
      .catch(error => {
        throw new Error(`Could not load texture from ${src}: ${error}`);
      });
  }
  return new Promise(resolve => resolve(getTextureFromData(gl, src, opts)));
}

/*
 * Convert image data into texture
 * @returns {Texture2D} texture
 */
function getTextureFromData(gl, data, opts) {
  if (data instanceof Texture2D) {
    return data;
  }
  return new Texture2D(gl, {data, ...opts});
}

const defaultProps = {
  heightMap: null,
  heightMapBounds: {type: 'array', value: [0, 0, 1, 1], compare: true},
  heightRange: {type: 'array', value: [0, 1], compare: true},
  imagery: null,
  imageryBounds: {type: 'array', value: [0, 0, 1, 1], compare: true},
  uCount: {type: 'number', value: 1, min: 0},
  vCount: {type: 'number', value: 1, min: 0},
  desaturate: {type: 'number', value: 0, min: 0, max: 1},
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]}
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export default class ImageryLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    // TODO/ib - Enabled to allow debugging of heightmaps, not perfect but really helps
    gl.getExtension('OES_standard_derivatives');
    this.setState({model: this.getModel(gl)});
  }

  updateState({props, oldProps, changeFlags}) {
    const {gl} = this.context;
    const {model} = this.state;

    const {heightMap, imagery, uCount, vCount} = props;
    if (heightMap && heightMap !== oldProps.heightMap) {
      getTexture(gl, heightMap).then(texture => {
        model.setUniforms({heightMapTexture: texture, hasHeightMap: true});
      });
    }
    if (imagery !== oldProps.imagery) {
      getTexture(gl, imagery).then(texture => {
        model.setUniforms({imageryTexture: texture});
      });
    }
    if (uCount !== oldProps.uCount || vCount !== oldProps.vCount) {
      const geometry = new GridGeometry({uCount, vCount});
      model.setGeometry(geometry);
      model.setVertexCount(geometry.getVertexCount());
    }
    if (changeFlags.propsChanged) {
      const {
        heightMapBounds,
        heightRange,
        imageryBounds,
        desaturate,
        transparentColor,
        tintColor
      } = props;
      model.setUniforms({
        heightMapBounds,
        heightRange,
        imageryBounds,
        desaturate,
        transparentColor,
        tintColor
      });
    }
  }

  getModel(gl) {
    // 3d surface
    return new Model(gl, {
      id: this.props.id,
      vs: IMAGERY_VERTEX_SHADER,
      fs: IMAGERY_FRAGMENT_SHADER,
      modules: ['picking'],
      shaderCache: this.context.shaderCache,
      geometry: new Geometry(),
      vertexCount: 0,
      isIndexed: true
    });
  }
}

ImageryLayer.layerName = 'ImageryLayer';
ImageryLayer.defaultProps = defaultProps;
