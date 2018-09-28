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

const CONTEXT_TYPES = {
  viewport: PropTypes.object
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
  static get contextTypes() {
    return CONTEXT_TYPES;
  }

  constructor(props) {
    super(props);

    // react-map-gl's autobind fails in inheritance
    this._contentLoaded = this._contentLoaded.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  _renderTip(anchorPosition) {
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

    if (z > 1 || z < -1 || x < 0 || x > viewport.width || y < 0 || y > viewport.height) {
      // Should be clipped
      containerStyle.display = 'none';
      positionType = this.props.anchor;
    } else {
      // Calculate dynamic position
      positionType = this._getPosition(x, y);
    }
    const anchorPosition = ANCHOR_POSITION[positionType];

    containerStyle.zIndex = Math.floor(((1 - z) / 2) * Z_INDEX_RANGE);
    containerStyle.transform = `translate(${-anchorPosition.x * 100}%, ${-anchorPosition.y *
      100}%)`;

    return React.createElement(
      'div',
      {
        className: `mapboxgl-popup mapboxgl-popup-anchor-${positionType}`,
        style: containerStyle,
        onClick: closeOnClick ? this._onClose : null
      },
      [this._renderTip(anchorPosition), this._renderContent()]
    );
  }
}
