import React, {PureComponent} from 'react';
import {withTheme, evaluateStyle} from '@streetscape.gl/monochrome';

import styled from '@emotion/styled';

const TooltipContainer = styled.div(props => ({
  ...props.theme.__reset__,
  position: 'absolute',
  pointerEvents: 'none',
  margin: props.theme.spacingNormal,
  padding: props.theme.spacingNormal,
  maxWidth: 320,
  overflow: 'hidden',
  background: props.theme.background,
  color: props.theme.textColorPrimary,
  zIndex: 100001,
  ...evaluateStyle(props.userStyle, props)
}));

const KEY_BLACKLIST = ['vertices', 'base', 'style', 'state', 'id', 'object_id'];

class HoverTooltip extends PureComponent {
  _renderEntries(object) {
    if (!object) {
      return null;
    }
    return Object.keys(object)
      .filter(key => !KEY_BLACKLIST.includes(key) && object[key] !== undefined)
      .map(key => (
        <div key={key}>
          <div>
            <b>{key}</b>
          </div>
          {String(object[key])}
        </div>
      ));
  }

  _renderContent = info => {
    const objectId = info.object.base && info.object.base.object_id;

    return [
      <div key="-stream-">
        <div>
          <b>stream</b>
        </div>
        {info.layer.props.streamName}
      </div>,
      objectId ? (
        <div key="-id-">
          <div>
            <b>id</b>
          </div>
          {objectId}
        </div>
      ) : null,
      <hr key="-separator-" />
    ].concat(this._renderEntries(info.object.base), this._renderEntries(info.object));
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
