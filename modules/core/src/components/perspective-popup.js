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
    const {tipSize, color} = this.props;
    const tipStyle = {
      width: tipSize,
      height: tipSize,
      position: 'relative',
      border: 'none'
    };
    const tipCircleStyle = {...STYLES.TIP_CIRCLE, background: color};
    const tipLineStyle = {...STYLES.TIP_LINE, borderColor: color};

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
      <div key="tip" className="mapboxgl-popup-tip" style={tipStyle}>
        <div style={tipCircleStyle} />
        <div style={tipLineStyle} />
      </div>
    );
  }

  _renderContent() {
    const {color} = this.props;

    return (
      <div
        key="content"
        ref={this._contentLoaded}
        className="mapboxgl-popup-content object-label--content"
        style={{background: color}}
      >
        {this.props.children}
      </div>
    );
  }
}
