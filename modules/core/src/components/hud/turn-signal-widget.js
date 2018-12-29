import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {evaluateStyle} from '@streetscape.gl/monochrome';
import styled from '@emotion/styled';

import BaseWidget from './base-widget';

const CONTAINER_STYLE = {lineHeight: 0, textAlign: 'center'};

const ArrowComponent = styled.svg(props => ({
  height: props.theme.controlSize,
  margin: props.theme.spacingTiny,
  fill: props.isOn ? props.theme.textColorPrimary : props.theme.controlColorDisabled,
  ...evaluateStyle(props.userStyle, props)
}));

export default class TurnSignalWidget extends PureComponent {
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
    const value = streams.signal.data && transformValue(streams.signal.data.variable);

    const styleProps = {theme, userStyle: style.arrow};

    return (
      <div style={CONTAINER_STYLE}>
        <ArrowComponent
          viewBox="0 0 18 16"
          isOn={value === 'left' || value === 'both'}
          {...styleProps}
        >
          <path d="M0,8 L8,16 L8,11 L18,11 L18,5 L8,5 L8,0z" />
        </ArrowComponent>
        <ArrowComponent
          viewBox="0 0 18 16"
          isOn={value === 'right' || value === 'both'}
          {...styleProps}
        >
          <path d="M18,8 L10,16 L10,11 L0,11 L0,5 L10,5 L10,0z" />
        </ArrowComponent>
      </div>
    );
  };

  render() {
    const {log, style, streamName} = this.props;

    return (
      <BaseWidget log={log} style={style} streamNames={{signal: streamName}}>
        {this._render}
      </BaseWidget>
    );
  }
}
