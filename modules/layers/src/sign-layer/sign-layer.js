import {IconLayer} from '@deck.gl/layers';

import vertex from './sign-layer-vertex.glsl';

const defaultProps = {
  ...IconLayer.defaultProps,
  render3D: true
};

export default class SignLayer extends IconLayer {
  initializeState() {
    super.initializeState();

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instanceAngles: {size: 1, accessor: 'getAngle'}
    });
  }

  updateState({oldProps, props, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});

    if (props.render3D !== oldProps.render3D) {
      this.state.model.setUniforms({render3D: props.render3D ? 1 : 0});
    }
  }

  getShaders() {
    return {
      ...super.getShaders(),
      vs: vertex,
      shaderCache: this.context.shaderCache
    };
  }
}

SignLayer.layerName = 'SignLayer';
SignLayer.defaultProps = defaultProps;
