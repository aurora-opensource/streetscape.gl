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
