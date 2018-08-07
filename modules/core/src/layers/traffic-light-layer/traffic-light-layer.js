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

import {Layer} from '@deck.gl/core';
import {Cube, Sphere} from 'luma.gl';
import GL from 'luma.gl/constants';
import Color from 'color';

import trafficLightLayerVertex from './traffic-light-layer-vertex.glsl';
import trafficLightLayerFragment from './traffic-light-layer-fragment.glsl';

import {makeLightShapeTexture} from './traffic-light-utils';

/* Util */
function parseColor(hex, opacity = 1) {
  const rgb = Color(hex).rgb();
  if (rgb.array) {
    const color = Color(hex)
      .rgb()
      .array();
    color.push(Math.round(opacity * 255));
    return color;
  }

  return [rgb.r, rgb.g, rgb.b, Math.round(opacity * 255)];
}

// keys are from Mercator API
const LIGHT_COLOR = {
  TRAFFIC_LIGHT_SECTION_COLOR_GREEN: parseColor('#00FF80'),
  TRAFFIC_LIGHT_SECTION_COLOR_YELLOW: parseColor('#FFF000'),
  TRAFFIC_LIGHT_SECTION_COLOR_RED: parseColor('#FF1010')
};

// keys are from Mercator API
const LIGHT_SHAPE = {
  TRAFFIC_LIGHT_SECTION_SHAPE_CIRCULAR: 0,
  TRAFFIC_LIGHT_SECTION_SHAPE_LEFT_TURN: 1,
  TRAFFIC_LIGHT_SECTION_SHAPE_RIGHT_TURN: 2
};

const defaultProps = {
  getPosition: x => x.position,
  getAngle: x => x.angle || 0,
  getShape: x => 'TRAFFIC_LIGHT_SECTION_SHAPE_CIRCULAR',
  getColor: x => 'TRAFFIC_LIGHT_SECTION_COLOR_GREEN',
  getState: x => 1,
  lightSettings: {}
};

export default class TrafficLightLayer extends Layer {
  getShaders() {
    return {
      vs: trafficLightLayerVertex,
      fs: trafficLightLayerFragment,
      modules: ['lighting', 'picking'],
      shaderCache: this.context.shaderCache
    };
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
        accessor: 'getPosition',
        update: this.calculateInstancePositions
      },
      instanceAngles: {size: 1, accessor: 'getAngle', update: this.calculateInstanceAngles},
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
        accessor: 'getState',
        update: this.calculateInstanceStates
      }
    });
    /* eslint-enable max-len */

    modelsByName.box.setUniforms({
      modelScale: [0.15, 0.25, 0.25],
      modelTranslate: [0, 0, 6],
      useInstanceColor: 0
    });

    modelsByName.lights.setUniforms({
      lightShapeTexture: makeLightShapeTexture(gl),
      modelScale: [0.15, 0.15, 0.15],
      modelTranslate: [-0.06, 0, 6],
      useInstanceColor: 1
    });
  }

  _getModels(gl) {
    const box = new Cube(gl, {
      id: `${this.props.id}-box`,
      ...this.getShaders(),
      isInstanced: true
    });

    const lights = new Sphere(gl, {
      id: `${this.props.id}-light`,
      ...this.getShaders(),
      isInstanced: true
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

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i++] = position[0];
      value[i++] = position[1];
      value[i++] = position[2];
    }
  }

  calculateInstanceAngles(attribute) {
    const {data, getAngle} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      value[i++] = getAngle(point) + Math.PI;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      const color = LIGHT_COLOR[getColor(point)] || [0, 0, 0];
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

  calculateInstanceStates(attribute) {
    const {data, getState} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const point of data) {
      value[i++] = getState(point);
    }
  }
}

TrafficLightLayer.layerName = 'TrafficLightLayer';
TrafficLightLayer.defaultProps = defaultProps;
