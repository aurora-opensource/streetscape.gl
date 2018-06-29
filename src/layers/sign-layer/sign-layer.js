import {IconLayer} from 'deck.gl';

import vertex from './sign-layer-vertex.glsl';

const defaultProps = {
  ...IconLayer.defaultProps,
  render3D: false,
  getAngle: x => x.angle || 0
};

export default class SignLayer extends IconLayer {

  initializeState() {
    super.initializeState();

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instanceAngles: {size: 1, accessor: 'getAngle', update: this.calculateInstanceAngles}
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

  calculateInstanceAngles(attribute) {
    const {data, getAngle} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      value[i++] = getAngle(object);
    }
  }

}

SignLayer.layerName = 'SignLayer';
SignLayer.defaultProps = defaultProps;
