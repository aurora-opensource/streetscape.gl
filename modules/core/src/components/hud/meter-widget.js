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
import {clamp} from 'math.gl';

import BaseWidget from './base-widget';

const GuageArc = styled.path(props => ({
  stroke: props.theme.controlColorDisabled,
  strokeCap: 'round',
  ...evaluateStyle(props.userStyle, props)
}));

const ZeroMarker = styled.circle(props => ({
  fill: props.theme.textColorPrimary,
  ...evaluateStyle(props.userStyle, props)
}));

const CmdMarker = styled.path(props => ({
  fill: props.theme.controlColorActive,
  ...evaluateStyle(props.userStyle, props)
}));

const GuageHand = styled.line(props => ({
  stroke: props.theme.textColorPrimary,
  strokeCap: 'round',
  strokeWidth: 2,
  ...evaluateStyle(props.userStyle, props)
}));

const CmdValue = styled.div(props => ({
  textAlign: 'right',
  flex: 1,
  padding: props.theme.spacingTiny,
  borderRightStyle: 'solid',
  borderRightWidth: 1,
  borderRightColor: props.theme.controlColorDisabled,
  color: props.warning ? props.theme.textColorWarning : props.theme.textColorPrimary,
  fontSize: props.theme.fontSize * 2,
  lineHeight: '1em',
  ...evaluateStyle(props.userStyle, props)
}));

const MsrValue = styled.div(props => ({
  textAlign: props.isOnlyValue ? 'center' : 'left',
  flex: 1,
  padding: props.theme.spacingTiny,
  fontSize: props.theme.fontSize * 2,
  color: props.warning ? props.theme.textColorWarning : props.theme.textColorPrimary,
  lineHeight: '1em',
  ...evaluateStyle(props.userStyle, props)
}));

const LabelComponent = styled.div(props => ({
  fontSize: props.theme.fontSize,
  color: props.theme.textColorSecondary,
  lineHeight: '1em',
  ...evaluateStyle(props.userStyle, props)
}));

const UnitsComponent = styled.div(props => ({
  textAlign: 'center',
  fontSize: props.theme.fontSize * 0.9,
  color: props.theme.textColorSecondary,
  ...evaluateStyle(props.userStyle, props)
}));

const Warning = styled.span(props => ({
  position: 'absolute',
  marginLeft: props.theme.spacingTiny,
  fontSize: props.theme.fontSize * 0.9,
  lineHeight: '1em',
  padding: props.theme.spacingTiny,
  borderRadius: 2,
  background: props.theme.warning400,
  color: props.theme.textColorInvert,
  ...evaluateStyle(props.userStyle, props)
}));

function getTransform(centerX, centerY, angle) {
  return `translate(${centerX} ${centerY}) rotate(${angle}) translate(${-centerX} ${-centerY})`;
}

function formatValue(value, precision = 3, transformValue) {
  if (!Number.isFinite(value)) {
    return '';
  }
  value = transformValue(value);
  const digits = value ? Math.max(1, Math.floor(Math.log10(Math.abs(value)) + 1)) : 1;

  return `${value.toFixed(Math.max(0, precision - digits))}`;
}

export default class MeterWidget extends PureComponent {
  static propTypes = {
    log: PropTypes.object.isRequired,
    style: PropTypes.object,
    precision: PropTypes.number,
    units: PropTypes.string,
    cmdStreamName: PropTypes.string,
    streamName: PropTypes.string.isRequired,
    label: PropTypes.string,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    transformValue: PropTypes.func,
    getWarning: PropTypes.func
  };

  static defaultProps = {
    precision: 3,
    style: {},
    transformValue: x => x,
    getWarning: _ => null
  };

  _renderGauge(cmdData, msrData, theme) {
    const {min, max, transformValue, style} = this.props;
    const {arcRadius: r = 50, arcWidth: w = 8} = style;
    const padding = 8;

    if (r <= w / 2) {
      return null;
    }

    const cmdValue = transformValue((cmdData && cmdData.data && cmdData.data.variable) || 0);
    const msrValue = transformValue((msrData.data && msrData.data.variable) || 0);

    const msr = clamp((msrValue - min) / (max - min), 0, 1);
    const cmd = clamp((cmdValue - min) / (max - min), 0, 1);
    const zero = clamp((0 - min) / (max - min), 0, 1);

    const msrTransform = getTransform(r + padding, r + padding, msr * 180 - 90);
    const cmdTransform = getTransform(r + padding, r + padding, cmd * 180 - 90);
    const zeroTransform = getTransform(r + padding, r + padding, zero * 180 - 90);

    return (
      <svg width={(r + padding) * 2} height={r + padding * 2}>
        <GuageArc
          d={`M ${padding + w / 2} ${r + padding} a ${r - w / 2} ${r - w / 2} 1 1 1 ${r * 2 - w} 0`}
          fill="none"
          strokeWidth={w}
          theme={theme}
          userStyle={style.arc}
        />

        <g transform={zeroTransform}>
          <ZeroMarker
            cx={r + padding}
            cy={padding - 4}
            r={2}
            theme={theme}
            userStyle={style.zeroMarker}
          />
        </g>
        {cmdData && (
          <g transform={cmdTransform}>
            <CmdMarker
              transform={`translate(${r + padding} ${padding})`}
              d={`M0,${w} L${-w / 2},0 L${w / 2},0z`}
              theme={theme}
              userStyle={style.cmdMarker}
            />
          </g>
        )}
        {msrData && (
          <g transform={msrTransform}>
            <GuageHand
              x1={r + padding}
              y1={r + padding}
              x2={r + padding}
              y2={padding + w + 4}
              theme={theme}
              userStyle={style.hand}
            />
          </g>
        )}
      </svg>
    );
  }

  _renderMetric(cmdData, msrData, theme) {
    const {label, units = msrData.units, transformValue, precision, getWarning, style} = this.props;

    const cmdValue = cmdData && cmdData.data && cmdData.data.variable;
    const msrValue = msrData.data && msrData.data.variable;
    const cmdWarning = getWarning(cmdValue);
    const msrWarning = getWarning(msrValue);

    return (
      <div>
        <div style={{display: 'flex'}}>
          {cmdData && (
            <CmdValue theme={theme} warning={cmdWarning} userStyle={style.cmdValue}>
              <LabelComponent theme={theme} warning={cmdWarning} userStyle={style.label}>
                Cmd.
              </LabelComponent>
              <div>{formatValue(cmdValue, precision, transformValue) || '-'}</div>
            </CmdValue>
          )}
          <MsrValue
            theme={theme}
            warning={msrWarning}
            isOnlyValue={!cmdData}
            userStyle={style.msrValue}
          >
            <LabelComponent theme={theme} warning={msrWarning} userStyle={style.label}>
              {label}
            </LabelComponent>
            <div>{formatValue(msrValue, precision, transformValue) || '-'}</div>
          </MsrValue>
        </div>
        <UnitsComponent theme={theme} userStyle={style.units}>
          {units}
          {(cmdWarning || msrWarning) && (
            <Warning theme={theme} userStyle={style.warning}>
              {cmdWarning || msrWarning}
            </Warning>
          )}
        </UnitsComponent>
      </div>
    );
  }

  _render = ({theme, streams}) => (
    <div>
      {this._renderGauge(streams.cmd, streams.msr, theme)}
      {this._renderMetric(streams.cmd, streams.msr, theme)}
    </div>
  );

  render() {
    const {log, style, cmdStreamName, streamName} = this.props;

    return (
      <BaseWidget log={log} style={style} streamNames={{cmd: cmdStreamName, msr: streamName}}>
        {this._render}
      </BaseWidget>
    );
  }
}
