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
import {DropdownIcon as DefaultDropdownIcon} from '../icons';

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

const DropdownBorder = styled.div(props => ({
  position: 'relative',
  width: '100%',
  height: props.height,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: getControlColor(props),
  ...evaluateStyle(props.userStyle, props)
}));

const DropdownInput = styled.select(props => ({
  cursor: 'pointer',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  lineHeight: `${props.height}px`,
  color: props.isEnabled ? props.theme.textColorPrimary : props.theme.textColorDisabled,

  appearance: 'none',
  background: props.theme.background,
  border: 'none',
  outline: 0,
  paddingLeft: props.theme.spacingSmall,
  paddingRight: props.theme.spacingLarge,

  ...evaluateStyle(props.userStyle, props)
}));

const DropdownIcon = styled.div(props => ({
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',

  color: getControlColor(props),
  padding: props.theme.spacingSmall,
  width: 16,
  height: 16,
  textAlign: 'center',
  lineHeight: '16px',
  path: {fill: 'currentColor'},

  ...evaluateStyle(props.userStyle, props)
}));

// Select component that takes an array and accessors and populates a dropdown
class Dropdown extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    data: PropTypes.object.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    isEnabled: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    style: {},
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
    const {onChange} = this.props;
    onChange(event.target.value);
  };

  render() {
    const {theme, style, className, data, value, isEnabled} = this.props;
    const {height = theme.controlSize + theme.spacingTiny * 2} = style;

    const styleProps = {
      theme,
      height,
      hasFocus: this.state.hasFocus,
      isHovered: this.state.isHovered,
      isEnabled
    };

    return (
      <WrapperComponent className={className} userStyle={style.wrapper} {...styleProps}>
        <DropdownBorder
          userStyle={style.border}
          {...styleProps}
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
        >
          <DropdownInput
            userStyle={style.select}
            {...styleProps}
            tabIndex={isEnabled ? 0 : -1}
            onFocus={this._onFocus}
            onBlur={this._onBlur}
            onChange={this._onChange}
            value={value}
          >
            {Object.keys(data).map(key => (
              <option key={key} value={key}>
                {data[key]}
              </option>
            ))}
          </DropdownInput>
          <DropdownIcon userStyle={style.icon} {...styleProps}>
            {style.iconArrow || <DefaultDropdownIcon />}
          </DropdownIcon>
        </DropdownBorder>
      </WrapperComponent>
    );
  }
}

export default withTheme(Dropdown);
