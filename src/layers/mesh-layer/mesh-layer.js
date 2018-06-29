// Copyright (c) 2015 Uber Technologies, Inc.
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

import {Layer} from 'deck.gl';
import {GL, Model, Geometry} from 'luma.gl';
import meshLayerVertex from './mesh-layer-vertex.glsl';
import meshLayerFragment from './mesh-layer-fragment.glsl';
import {getTexture} from '../layer-utils';

function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}

export default class MeshLayer extends Layer {

  static layerName = 'MeshLayer';
  static defaultProps = {
    getPosition: x => x.position,
    getAngleDegreesCW: x => x.angle || 0,
    getColor: x => x.color || [0, 0, 255],
    desaturate: 0,
    brightness: 0,
    meterScale: 1,
    mesh: {},
    texture: null,
    parameters: {
      depthTest: true,
      depthFunc: GL.LEQUAL
    },
    lightSettings: {}
  };

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceAngles: {size: 1, update: this.calculateInstanceAngles}
    });
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    const {meterScale, desaturate, brightness} = props;
    const {model} = this.state;

    model.setUniforms({meterScale, desaturate, brightness});

    if (props.texture !== oldProps.texture) {
      this.loadTexture(props.texture);
    }
  }

  getModel(gl) {
    return new Model(gl, {
      id: this.props.id,
      vs: meshLayerVertex,
      fs: meshLayerFragment,
      modules: ['lighting', 'picking'],
      shaderCache: this.context.shaderCache,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        attributes: {
          indices: this.props.mesh.indices,
          positions: this.props.mesh.vertices,
          normals: this.props.mesh.vertexNormals,
          texCoords: this.props.mesh.textures
        }
      }),
      isInstanced: true
    });
  }

  loadTexture(src) {
    const {gl} = this.context;
    const {model} = this.state;

    getTexture(gl, src).then(texture => {
      this.setState({texture});
      model.setUniforms({sampler1: texture});
    });
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = position[2] || 0;
      i += size;
    }
  }

  calculateInstanceAngles(attribute) {
    const {data, getAngleDegreesCW} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const angle = getAngleDegreesCW(point);
      value[i] = -degreeToRadian(angle);
      i += size;
    }
  }
}
