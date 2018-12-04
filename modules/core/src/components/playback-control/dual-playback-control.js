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
    markers: [],
    lookAhead: 0,
    maxLookAhead: 10000,
    formatLookAhead: String,
    onLookAheadChange: () => {}
  };

  _renderLookAheadSlider() {
    const {theme, style, isPlaying, lookAhead, formatLookAhead, maxLookAhead, step} = this.props;

    return (
      <LookAheadContainer theme={theme} isPlaying={isPlaying} userStyle={style.lookAhead}>
        <Slider
          style={style.lookAheadSlider}
          value={lookAhead}
          min={0}
          max={maxLookAhead}
          step={step}
          size={16}
          onChange={this.props.onLookAheadChange}
        />
        <LookAheadTimestamp
          theme={theme}
          isPlaying={isPlaying}
          userStyle={style.lookAheadTimestamp}
        >
          Look ahead: {formatLookAhead(lookAhead)}
        </LookAheadTimestamp>
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
