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
import {Cube, Sphere, fp64} from '@luma.gl/core';
const {fp64LowPart} = fp64;
import GL from '@luma.gl/constants';

import vs from './traffic-light-layer-vertex.glsl';
import fs from './traffic-light-layer-fragment.glsl';

import {makeLightShapeTexture} from './traffic-light-utils';

const LIGHT_COLOR = {
  invalid: [0, 0, 0],
  green: [0, 255, 128],
  yellow: [255, 250, 0],
  red: [255, 16, 16]
};

/* eslint-disable camelcase */
const LIGHT_SHAPE = {
  circular: 0,
  left_arrow: 1,
  right_arrow: 2
};
/* eslint-enable camelcase */

const defaultProps = {
  getPosition: {type: 'accessor', value: x => x.position},
  getAngle: {type: 'accessor', value: 0},
  getShape: {type: 'accessor', value: x => 'circular'},
  getColor: {type: 'accessor', value: x => 'green'},
  getState: {type: 'accessor', value: 1},

  sizeScale: {type: 'number', value: 0.15, min: 0},

  fp64: false,
  lightSettings: {}
};

export default class TrafficLightLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'lighting', 'picking']};
  }

  initializeState() {
    const {gl} = this.context;
    const modelsByName = this._getModels(gl);
    this.setState({
      models: [modelsByName.box, modelsByName.lights],
      modelsByName
    });

    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        accessor: 'getPosition'
      },
      instancePositions64xyLow: {
        size: 2,
        accessor: 'getPosition',
        update: this.calculateInstancePositions64xyLow
      },
      instanceAngles: {size: 1, accessor: 'getAngle'},
      instanceShapes: {
        size: 1,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getShape',
        update: this.calculateInstanceShapes
      },
      instanceColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getColor',
        update: this.calculateInstanceColors
      },
      instanceStates: {
        size: 1,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getState'
      }
    });
    /* eslint-enable max-len */
  }

  draw({uniforms}) {
    const {sizeScale} = this.props;
    const {modelsByName} = this.state;

    modelsByName.box.render(
      Object.assign({}, uniforms, {
        modelScale: [sizeScale * 0.8, sizeScale * 1.6, sizeScale * 1.6]
      })
    );
    modelsByName.lights.render(
      Object.assign({}, uniforms, {
        modelScale: [sizeScale, sizeScale, sizeScale]
      })
    );
  }

  _getModels(gl) {
    const shaders = this.getShaders();

    const box = new Cube(gl, {
      id: `${this.props.id}-box`,
      ...shaders,
      shaderCache: this.context.shaderCache,
      isInstanced: true,
      uniforms: {
        modelTranslate: [0, 0, 0],
        useInstanceColor: false
      }
    });

    const lights = new Sphere(gl, {
      id: `${this.props.id}-light`,
      ...shaders,
      shaderCache: this.context.shaderCache,
      isInstanced: true,
      uniforms: {
        lightShapeTexture: makeLightShapeTexture(gl),
        modelTranslate: [0.4, 0, 0],
        useInstanceColor: true
      }
    });

    return {box, lights};
  }

  updateAttributes(props) {
    super.updateAttributes(props);
    const attributeManager = this.getAttributeManager();
    const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});

    for (const model of this.getModels()) {
      model.setInstanceCount(this.props.data.length);
      model.setAttributes(changedAttributes);
    }
  }

  calculateInstancePositions64xyLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const color = LIGHT_COLOR[getColor(point)] || LIGHT_COLOR.invalid;
      value[i++] = color[0];
      value[i++] = color[1];
      value[i++] = color[2];
    }
  }

  calculateInstanceShapes(attribute) {
    const {data, getShape} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      value[i++] = LIGHT_SHAPE[getShape(point)] || 0;
    }
  }
}

TrafficLightLayer.layerName = 'TrafficLightLayer';
TrafficLightLayer.defaultProps = defaultProps;
