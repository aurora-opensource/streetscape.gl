import React, {PureComponent} from 'react';
import {withTheme, evaluateStyle} from '@streetscape.gl/monochrome';

import styled from '@emotion/styled';

const TooltipContainer = styled.div(props => ({
  ...props.theme.__reset__,
  position: 'absolute',
  zIndex: 1,
  pointerEvents: 'none',
  margin: props.theme.spacingNormal,
  padding: props.theme.spacingSmall,
  maxWidth: 320,
  background: props.theme.background,
  color: props.theme.textColorPrimary,
  ...evaluateStyle(props.userStyle, props)
}));

const KEY_BLACKLIST = ['vertices', 'base'];

class HoverTooltip extends PureComponent {
  _renderEntries(object) {
    if (!object) {
      return null;
    }
    return Object.keys(object)
      .filter(key => !KEY_BLACKLIST.includes(key) && object[key] !== undefined)
      .map(key => (
        <div key={key}>
          <b>{key}: </b>
          {String(object[key])}
        </div>
      ));
  }

  _renderContent = info => {
    return (
      <div>
        <div>
          <b>Stream: </b>
          {info.layer.props.streamName}
        </div>
        {this._renderEntries(info.object.base)}
        {this._renderEntries(info.object)}
      </div>
    );
  };

  render() {
    const {theme, info, style, renderContent = this._renderContent} = this.props;

    return (
      <TooltipContainer theme={theme} style={{left: info.x, top: info.y}} userStyle={style}>
        {renderContent(info)}
      </TooltipContainer>
    );
  }
}

export default withTheme(HoverTooltip);
