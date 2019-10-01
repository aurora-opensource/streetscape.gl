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

import {CheckBox, Dropdown, RadioBox, Slider, TextBox, Toggle, Label} from '../shared';
import {Title, Heading, Separator} from './styled-components';

import styled from '@emotion/styled';
import {evaluateStyle} from '../shared/theme';

const InputContainer = styled.div(props => ({
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: props.level * props.theme.spacingLarge,
  marginBottom: props.theme.spacingSmall,

  '>label': {
    marginTop: props.theme.spacingTiny,
    marginRight: props.theme.spacingSmall
  },

  '>label + div': {
    flexGrow: 1,
    maxWidth: 320
  },

  ...evaluateStyle(props.userStyle, props)
}));

export default class Input extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired
  };

  static defaultProps = {
    className: ''
  };

  constructor(props) {
    super(props);

    this.renders = {
      title: this._renderTitle,
      header: this._renderHeading,
      separator: this._renderSeparator,
      toggle: this._renderToggle,
      text: this._renderTextBox,
      range: this._renderSlider,
      select: this._renderDropdown,
      radio: this._renderRadio,
      checkbox: this._renderCheckbox,
      custom: this._renderCustom
    };
  }

  _onChange = value => {
    this.props.onChange(this.props.name, value);
  };

  _renderTitle = (props, userStyle) => {
    return (
      <Title {...props} userStyle={userStyle}>
        {props.title}
      </Title>
    );
  };

  _renderHeading = (props, userStyle) => {
    return (
      <Heading {...props} userStyle={userStyle}>
        {props.title}
      </Heading>
    );
  };

  _renderSeparator = (props, userStyle) => {
    return <Separator {...props} userStyle={userStyle} />;
  };

  _renderToggle = (props, style) => {
    const {label, onTitle, offTitle, value, className} = this.props;

    const labelText = (value ? onTitle : offTitle) || label;

    return (
      <Toggle
        {...props}
        style={style}
        className={className}
        label={this._renderLabel(labelText)}
        onChange={this._onChange}
      />
    );
  };

  _renderSlider = (props, style) => {
    return [
      this._renderLabel(),
      <Slider key="slider" {...props} style={style} onChange={this._onChange} />
    ];
  };

  _renderDropdown = (props, style) => {
    return [
      this._renderLabel(),
      <Dropdown key="dropdown" {...props} style={style} onChange={this._onChange} />
    ];
  };

  _renderRadio = (props, style) => {
    return [
      this._renderLabel(),
      <RadioBox key="radio" {...props} style={style} onChange={this._onChange} />
    ];
  };

  _renderTextBox = (props, style) => {
    return [
      this._renderLabel(),
      <TextBox key="textbox" {...props} style={style} onChange={this._onChange} />
    ];
  };

  _renderCheckbox = (props, style) => {
    return (
      <CheckBox {...props} label={this._renderLabel()} style={style} onChange={this._onChange} />
    );
  };

  _renderCustom = () => {
    return this.props.render(this.props);
  };

  _renderLabel = (label = this.props.label) => {
    const {isEnabled, tooltip, badge, style} = this.props;
    return (
      label && (
        <Label
          key="label"
          isEnabled={isEnabled}
          tooltip={tooltip}
          badge={badge}
          style={style.label}
        >
          {label}
        </Label>
      )
    );
  };

  /* eslint-disable no-unused-vars */
  render() {
    const {style, type, onChange, label, tooltip, badge, ...otherProps} = this.props;

    const render = this.renders[type];
    if (!render) {
      throw new Error(`Unknown setting type ${type}`);
    }

    const inputStyle = style[type];

    return (
      <InputContainer {...otherProps} userStyle={style.item}>
        {render(otherProps, inputStyle)}
      </InputContainer>
    );
  }
}
