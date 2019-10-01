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
import {ClearIcon} from '../icons';

function getControlColor(props) {
  if (!props.isEnabled) {
    return props.theme.controlColorDisabled;
  } else if (props.hasFocus) {
    return props.theme.controlColorActive;
  } else if (props.isHovered) {
    return props.theme.controlColorHovered;
  }
  return props.theme.controlColorPrimary;
}

const WrapperComponent = styled.div(props => ({
  ...props.theme.__reset__,
  pointerEvents: props.isEnabled ? 'all' : 'none',
  ...evaluateStyle(props.userStyle, props)
}));

const TextBoxBorder = styled.div(props => ({
  position: 'relative',
  width: '100%',
  height: props.height,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: getControlColor(props),
  ...evaluateStyle(props.userStyle, props)
}));

const TextBoxInput = styled.input(props => ({
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  lineHeight: `${props.height}px`,

  background: props.theme.background,
  outline: 'none',
  paddingLeft: props.theme.spacingSmall,
  paddingRight: props.theme.spacingSmall,
  color: props.isEnabled ? props.theme.textColorPrimary : props.theme.textColorDisabled,
  border: 'none',
  ...evaluateStyle(props.userStyle, props)
}));

const TextBoxClearButton = styled.div(props => ({
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  color: props.theme.controlColorPrimary,

  padding: props.theme.spacingSmall,
  width: 16,
  height: 16,
  textAlign: 'center',
  lineHeight: '16px',
  path: {fill: 'currentColor'},
  '&:hover': {
    color: props.theme.controlColorHovered
  },
  ...evaluateStyle(props.userStyle, props)
}));

// Input component that can be toggled on and off
class TextBox extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    showClearButton: PropTypes.bool,
    isEnabled: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    style: {},
    showClearButton: true,
    isEnabled: true,
    onChange: () => {}
  };

  state = {
    hasFocus: false,
    isHovered: false
  };

  _onMouseEnter = () => this.setState({isHovered: true});

  _onMouseLeave = () => this.setState({isHovered: false});

  _onFocus = () => this.setState({hasFocus: true});

  _onBlur = () => this.setState({hasFocus: false});

  _onChange = event => {
    this.props.onChange(event.target.value);
  };

  _onClear = event => {
    this.props.onChange('');
  };

  render() {
    const {value, className, theme, style, showClearButton, isEnabled} = this.props;
    const {height = theme.controlSize + theme.spacingTiny * 2} = style;

    const styleProps = {
      theme,
      height,
      isEnabled,
      isHovered: this.state.isHovered,
      hasFocus: this.state.hasFocus
    };

    return (
      <WrapperComponent className={className} userStyle={style.wrapper} {...styleProps}>
        <TextBoxBorder
          userStyle={style.border}
          {...styleProps}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
        >
          <TextBoxInput
            userStyle={style.input}
            {...styleProps}
            ref={ref => {
              this._input = ref;
            }}
            type="text"
            tabIndex={isEnabled ? 0 : -1}
            onFocus={this._onFocus}
            onBlur={this._onBlur}
            onChange={this._onChange}
            value={value}
          />
          {Boolean(value && showClearButton && isEnabled) && (
            <TextBoxClearButton userStyle={style.clear} {...styleProps} onClick={this._onClear}>
              {style.iconClear || <ClearIcon />}
            </TextBoxClearButton>
          )}
        </TextBoxBorder>
      </WrapperComponent>
    );
  }
}

export default withTheme(TextBox);
