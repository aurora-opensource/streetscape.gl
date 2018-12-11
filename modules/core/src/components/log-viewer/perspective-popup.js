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
  ...evaluateStyle(props.userStyle, props)
}));

const PopupLine = styled.div(props => ({
  position: 'absolute',
  borderLeftStyle: 'solid',
  borderLeftWidth: 1,
  ...evaluateStyle(props.userStyle, props)
}));

const PopupContent = styled.div(props => ({
  ...props.theme.__reset__,
  ...evaluateStyle(props.userStyle, props)
}));

/* Like Popup but deal with z */
class PerspectivePopup extends Popup {
  _renderTip(positionType) {
    const anchorPosition = ANCHOR_POSITION[positionType];
    const {theme, style} = this.props;
    const {objectLabelTipSize = 30, objectLabelColor = theme.background} = style;
    const tipStyle = {
      width: objectLabelTipSize,
      height: objectLabelTipSize,
      position: 'relative',
      border: 'none'
    };

    const tipCircleStyle = {background: objectLabelColor};
    const tipLineStyle = {borderColor: objectLabelColor};

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
        <PopupTip
          style={tipCircleStyle}
          theme={theme}
          position={positionType}
          userStyle={style.objectLabelTip}
        />
        <PopupLine
          style={tipLineStyle}
          theme={theme}
          position={positionType}
          userStyle={style.objectLabelLine}
        />
      </div>
    );
  }

  _renderContent() {
    const {theme, style} = this.props;

    return (
      <PopupContent
        key="content"
        ref={this._contentLoaded}
        className="mapboxgl-popup-content"
        theme={theme}
        style={{background: style.objectLabelColor}}
        userStyle={style.objectLabelBody}
      >
        {this.props.children}
      </PopupContent>
    );
  }
}

export default withTheme(PerspectivePopup);
