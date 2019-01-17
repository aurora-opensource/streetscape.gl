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
import {PlaybackControl, Slider, withTheme, evaluateStyle} from '@streetscape.gl/monochrome';

import styled from '@emotion/styled';

const LookAheadContainer = styled.div(props => ({
  display: 'flex',
  alignItems: 'center',
  width: 200,
  '>div': {
    flexGrow: 1
  },
  ...evaluateStyle(props.userStyle, props)
}));

const LookAheadTimestamp = styled.span(props => ({
  marginLeft: props.theme.spacingNormal,
  marginRight: props.theme.spacingNormal,
  ...evaluateStyle(props.userStyle, props)
}));

const lookAheadMarkerStyle = props => ({
  position: 'absolute',
  boxSizing: 'content-box',
  borderStyle: 'solid',
  marginTop: 6,
  marginLeft: -6,
  borderWidth: 6,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: '#888',
  borderBottomStyle: 'none',

  transitionProperty: 'left',
  transitionDuration: props.isPlaying ? '0s' : props.theme.transitionDuration,

  ...evaluateStyle(props.userStyle, props)
});

class DualPlaybackControl extends PureComponent {
  static propTypes = {
    ...PlaybackControl.propTypes,
    lookAhead: PropTypes.number,
    maxLookAhead: PropTypes.number,
    formatLookAhead: PropTypes.func,
    onLookAheadChange: PropTypes.func
  };

  static defaultProps = {
    ...PlaybackControl.defaultProps,
    step: 0,
    markers: [],
    lookAhead: 0,
    maxLookAhead: 10,
    formatTick: null,
    formatTimestamp: null,
    formatLookAhead: x => PlaybackControl.formatTimeCode(x, '{ss}.{S}'),
    onLookAheadChange: () => {}
  };

  _renderLookAheadSlider() {
    const {theme, style, isPlaying, lookAhead, formatLookAhead, maxLookAhead, step} = this.props;

    return (
      <LookAheadContainer theme={theme} isPlaying={isPlaying} userStyle={style.lookAhead}>
        <LookAheadTimestamp
          theme={theme}
          isPlaying={isPlaying}
          userStyle={style.lookAheadTimestamp}
        >
          Look ahead: {formatLookAhead(lookAhead)}
        </LookAheadTimestamp>
        <Slider
          style={style.lookAheadSlider}
          value={lookAhead}
          min={0}
          max={maxLookAhead}
          step={step}
          size={16}
          onChange={this.props.onLookAheadChange}
        />
      </LookAheadContainer>
    );
  }

  render() {
    const {
      theme,
      isPlaying,
      markers: userMarkers,
      style,
      children,
      currentTime,
      lookAhead,
      endTime
    } = this.props;
    const lookAheadTime = Math.min(endTime, currentTime + lookAhead);

    const markers = userMarkers.concat({
      time: lookAheadTime,
      style: lookAheadMarkerStyle({theme, isPlaying, userStyle: style.lookAheadMarker})
    });

    return (
      <PlaybackControl {...this.props} markers={markers}>
        {children}
        <div style={{flexGrow: 1}} />
        {this._renderLookAheadSlider()}
      </PlaybackControl>
    );
  }
}

const ThemedDualPlaybackControl = withTheme(DualPlaybackControl);
ThemedDualPlaybackControl.formatTimeCode = PlaybackControl.formatTimeCode;

export default ThemedDualPlaybackControl;
