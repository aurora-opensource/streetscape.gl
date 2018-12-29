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
