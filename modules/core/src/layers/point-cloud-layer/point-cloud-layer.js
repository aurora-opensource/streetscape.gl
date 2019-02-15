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

const COLOR_MODE = {
  inline: 0,
  z: 1,
  distance: 2
};

const DEFAULT_COLOR_DOMAIN = {
  z: [-1.5, 1.5],
  distance: [0, 60]
};

const defaultProps = {
  colorMode: 'inline',
  colorDomain: null
};

export default class PointCloudLayer extends CorePointCloudLayer {
  getShaders() {
    const shaders = super.getShaders();
    shaders.vs = vs;
    return shaders;
  }

  draw({uniforms}) {
    const {radiusPixels, colorMode, colorDomain} = this.props;
    this.state.model.render(
      Object.assign({}, uniforms, {
        radiusPixels,
        colorMode: COLOR_MODE[colorMode] || 0,
        colorDomain: colorDomain || DEFAULT_COLOR_DOMAIN[colorMode] || [0, 0]
      })
    );
  }
}

PointCloudLayer.layerName = 'PointCloudLayer';
PointCloudLayer.defaultProps = defaultProps;
