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

import {PointCloudLayer as CorePointCloudLayer} from '@deck.gl/layers';

import vs from './point-cloud-layer-vertex.glsl';

/* eslint-disable camelcase */
const COLOR_MODE = {
  default: 0,
  elevation: 1,
  distance_to_vehicle: 2
};

const COLOR_DOMAIN = {
  default: [0, 0],
  elevation: [0, 3],
  distance_to_vehicle: [0, 60]
};
/* eslint-enable camelcase */

const defaultProps = {
  colorMode: 'default',
  colorDomain: null
};

export default class PointCloudLayer extends CorePointCloudLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.vs = vs;
    return shaders;
  }

  updateState(params) {
    super.updateState(params);

    const {props, oldProps} = params;
    if (
      props.modelMatrix !== oldProps.modelMatrix ||
      props.vehicleRelativeTransform !== oldProps.vehicleRelativeTransform
    ) {
      const vehicleDistanceTransform = props.vehicleRelativeTransform.clone().invert();
      if (props.modelMatrix) {
        vehicleDistanceTransform.multiplyRight(props.modelMatrix);
      }
      this.setState({
        vehicleDistanceTransform
      });
    }

    if (props.instanceColors !== oldProps.instanceColors) {
      const {instanceColors} = this.getAttributeManager().getAttributes();
      const colorSize = props.instanceColors ? props.instanceColors.length / props.numInstances : 4;
      instanceColors.size = colorSize;
      this.setState({colorSize});
    }
  }

  draw({uniforms}) {
    const {pointSize, colorMode, colorDomain} = this.props;
    const {vehicleDistanceTransform, colorSize} = this.state;

    this.state.model
      .setUniforms(
        Object.assign({}, uniforms, {
          pointSize,
          colorSize,
          colorMode: COLOR_MODE[colorMode] || COLOR_MODE.default,
          colorDomain: colorDomain || COLOR_DOMAIN[colorMode] || COLOR_DOMAIN.default,
          vehicleDistanceTransform
        })
      )
      .draw();
  }
}

PointCloudLayer.layerName = 'PointCloudLayer';
PointCloudLayer.defaultProps = defaultProps;
