import React from 'react';
import PropTypes from 'prop-types';
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

const Z_INDEX_RANGE = 1000;

/* Like Popup but deal with z */
export default class PerspectivePopup extends Popup {

  static contextTypes = {
    viewport: PropTypes.object
  };

  constructor(props) {
    super(props);

    // react-map-gl's autobind fails in inheritance
    this._contentLoaded = this._contentLoaded.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  _renderTip(anchor, anchorPosition) {
    const {tipSize} = this.props;
    const tipStyle = {
      width: tipSize,
      height: tipSize
    };
    return <div key="tip" className="mapboxgl-popup-tip" style={tipStyle} />;
  }

  render() {
    const {longitude, latitude, altitude = 0, offsetLeft, offsetTop, closeOnClick} = this.props;
    const {viewport} = this.context;

    const [x, y, z] = viewport.project([longitude, latitude, altitude]);
    const containerStyle = {
      position: 'absolute',
      left: x + offsetLeft,
      top: y + offsetTop
    };
    let positionType;

    if (z > 1 || z < -1 ||
      x < 0 || x > viewport.width ||
      y < 0 || y > viewport.height) {
      // Should be clipped
      containerStyle.display = 'none';
      positionType = this.props.anchor;
    } else {
      // Calculate dynamic position
      positionType = this._getPosition(x, y);
    }
    const anchorPosition = ANCHOR_POSITION[positionType];

    containerStyle.zIndex = Math.floor((1 - z) / 2 * Z_INDEX_RANGE);
    containerStyle.transform = `translate(${-anchorPosition.x * 100}%, ${-anchorPosition.y * 100}%)`;

    return React.createElement('div', {
      className: `mapboxgl-popup mapboxgl-popup-anchor-${positionType}`,
      style: containerStyle,
      onClick: closeOnClick ? this._onClose : null
    }, [
      this._renderTip([x, y], anchorPosition),
      this._renderContent()
    ]);
  }
}
