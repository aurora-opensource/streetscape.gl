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
import PropTypes from 'prop-types';

import styled from '@emotion/styled';
import {withTheme, evaluateStyle} from '../theme';
import {InfoIcon} from '../icons';

import {Tooltip} from '../popover';

const LabelComponent = styled.label(props => ({
  ...props.theme.__reset__,
  display: 'flex',
  alignItems: 'center',
  cursor: 'inherit',
  color: props.isEnabled ? props.theme.textColorPrimary : props.theme.textColorDisabled,

  '>*': {
    marginLeft: props.theme.spacingNormal
  },

  ...evaluateStyle(props.userStyle, props)
}));

const LabelInfo = styled.div(props => ({
  display: 'inline-block',
  color: props.isEnabled ? props.theme.controlColorPrimary : props.theme.controlColorDisabled,
  cursor: 'default',
  verticalAlign: 'middle',
  width: 16,
  height: 16,
  lineHeight: '16px',
  textAlign: 'center',
  path: {fill: 'currentColor'},

  ...evaluateStyle(props.userStyle, props)
}));

// Input component that can be toggled on and off
class Label extends PureComponent {
  static propTypes = {
    for: PropTypes.string,
    style: PropTypes.object,
    tooltip: PropTypes.string,
    badge: PropTypes.element,
    isEnabled: PropTypes.bool
  };

  static defaultProps = {
    style: {},
    isEnabled: true
  };

  render() {
    const {theme, isEnabled, for: htmlFor, style, children, tooltip, badge} = this.props;
    const labelProps = {};

    if (htmlFor) {
      labelProps.htmlFor = htmlFor;
    }

    const styleProps = {
      theme,
      isEnabled
    };

    return (
      <LabelComponent {...styleProps} userStyle={style.label}>
        {children}
        {tooltip && (
          <Tooltip style={style.tooltip} content={tooltip}>
            <LabelInfo {...styleProps} userStyle={style.tooltipTarget}>
              {style.iconInfo || <InfoIcon />}
            </LabelInfo>
          </Tooltip>
        )}
        {badge}
      </LabelComponent>
    );
  }
}

export default withTheme(Label);
