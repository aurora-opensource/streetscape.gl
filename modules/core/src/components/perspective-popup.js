import React from 'react';
import {Popup} from 'react-map-gl';

// Copied from 'react-map-gl/src/utils/dynamic-position.js'
const ANCHOR_POSITION = {
  top: {x: 0.5, y: 0},
  'top-left': {x: 0, y: 0},
  'top-right': {x: 1, y: 0},
  bottom: {x: 0.5, y: 1},
  'bottom-left': {x: 0, y: 1},
  'bottom-right': {x: 1, y: 1},
  left: {x: 0, y: 0.5},
  right: {x: 1, y: 0.5}
};

const STYLES = {
  TIP_CIRCLE: {
    position: 'absolute',
    width: 4,
    height: 4,
    margin: -2,
    borderRadius: 2
  },
  TIP_LINE: {
    position: 'absolute',
    opacity: 0.25,
    borderLeftStyle: 'solid',
    borderLeftWidth: 1
  }
};

/* Like Popup but deal with z */
export default class PerspectivePopup extends Popup {
  _renderTip(positionType) {
    const anchorPosition = ANCHOR_POSITION[positionType];
    const {tipSize, tipColor = '#fff'} = this.props;
    const tipStyle = {
      width: tipSize,
      height: tipSize,
      position: 'relative'
    };
    const tipCircleStyle = {...STYLES.TIP_CIRCLE, background: tipColor};
    const tipLineStyle = {...STYLES.TIP_LINE, borderColor: tipColor};

    switch (anchorPosition.x) {
      case 0.5:
        tipCircleStyle.left = '50%';
        tipLineStyle.left = '50%';
        break;
      case 1:
        tipCircleStyle.right = 0;
        tipLineStyle.right = 0;
        break;
      case 0:
      default:
    }

    switch (anchorPosition.y) {
      case 0.5:
        tipLineStyle.width = '100%';
        tipCircleStyle.top = '50%';
        tipLineStyle.top = '50%';
        break;
      case 1:
        tipCircleStyle.bottom = 0;
        tipLineStyle.height = '100%';
        break;
      case 0:
      default:
        tipLineStyle.height = '100%';
    }

    return (
      <div key="tip" style={tipStyle}>
        <div style={tipCircleStyle} />
        <div style={tipLineStyle} />
      </div>
    );
  }
}
