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
import {evaluateStyle} from '@streetscape.gl/monochrome';
import styled from '@emotion/styled';

import BaseWidget from './base-widget';

const Container = styled.div(props => ({
  display: 'flex',
  justifyContent: 'center',
  flexDirection: props.layout === 'vertical' ? 'column' : 'row'
}));

const COLORS = {
  red: '#d42e22',
  yellow: '#f8ce46',
  green: '#57ad57'
};

const LightComponent = styled.div(props => ({
  boxSizing: 'border-box',
  width: props.theme.controlSize,
  height: props.theme.controlSize,
  margin: props.theme.spacingTiny,
  borderRadius: '50%',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: COLORS[props.color],
  background: props.isOn ? COLORS[props.color] : 'none',
  ...evaluateStyle(props.userStyle, props)
}));

export default class TrafficLightWidget extends PureComponent {
  static propTypes = {
    log: PropTypes.object.isRequired,
    style: PropTypes.object,
    streamName: PropTypes.string.isRequired,
    transformValue: PropTypes.func
  };

  static defaultProps = {
    style: {},
    transformValue: x => x
  };

  _render = ({theme, streams}) => {
    const {transformValue, style} = this.props;
    const value = streams.light.data && transformValue(streams.light.data.variable);

    const styleProps = {theme, userStyle: style.light};

    return (
      <Container theme={theme} layout={style.layout}>
        <LightComponent key="red" color="red" isOn={value === 'red'} {...styleProps} />
        <LightComponent key="yellow" color="yellow" isOn={value === 'yellow'} {...styleProps} />
        <LightComponent key="green" color="green" isOn={value === 'green'} {...styleProps} />
      </Container>
    );
  };

  render() {
    const {log, style, streamName} = this.props;

    return (
      <BaseWidget log={log} style={style} streamNames={{light: streamName}}>
        {this._render}
      </BaseWidget>
    );
  }
}
