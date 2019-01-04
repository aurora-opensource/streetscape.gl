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
import {withTheme, evaluateStyle} from '@streetscape.gl/monochrome';

import styled from '@emotion/styled';

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

const PopupTip = styled.div(props => ({
  position: 'absolute',
  width: 4,
  height: 4,
  margin: -2,
  borderRadius: 2,
  background: props.color,
  ...evaluateStyle(props.userStyle, props)
}));

const PopupLine = styled.div(props => ({
  position: 'absolute',
  borderLeftStyle: 'solid',
  borderLeftWidth: 1,
  borderColor: props.color,
  ...evaluateStyle(props.userStyle, props)
}));

const PopupContent = styled.div(props => ({
  ...props.theme.__reset__,
  background: props.color,
  ...evaluateStyle(props.userStyle, props)
}));

/* Like Popup but deal with z */
class PerspectivePopup extends Popup {
  _renderTip(positionType) {
    const anchorPosition = ANCHOR_POSITION[positionType];
    const {theme, style} = this.props;
    const {objectLabelTipSize = 30, objectLabelColor = theme.background} = style;

    const styleProps = {
      ...this.props.styleProps,
      theme,
      color: objectLabelColor,
      position: positionType
    };

    const tipSize = evaluateStyle(objectLabelTipSize, styleProps);

    const tipStyle = {
      width: tipSize,
      height: tipSize,
      position: 'relative',
      border: 'none'
    };

    const tipCircleStyle = {};
    const tipLineStyle = {};

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
        <PopupTip style={tipCircleStyle} {...styleProps} userStyle={style.objectLabelTip} />
        <PopupLine style={tipLineStyle} {...styleProps} userStyle={style.objectLabelLine} />
      </div>
    );
  }

  _renderContent() {
    const {theme, styleProps, style} = this.props;

    return (
      <PopupContent
        key="content"
        ref={this._contentLoaded}
        className="mapboxgl-popup-content"
        theme={theme}
        {...styleProps}
        color={style.objectLabelColor}
        userStyle={style.objectLabelBody}
      >
        {this.props.children}
      </PopupContent>
    );
  }
}

export default withTheme(PerspectivePopup);
