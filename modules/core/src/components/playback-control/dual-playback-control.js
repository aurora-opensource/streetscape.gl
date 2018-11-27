import React from 'react';
import PropTypes from 'prop-types';
import {PlaybackControl as MonochromePlaybackControl, Slider} from 'monochrome-ui';

const LOOKAHEAD_CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center'
};

const LOOKAHEAD_SLIDER_STYLE = {
  width: 120,
  marginRight: 8
};

const LOOKAHEAD_MARKER_STYLE = {
  position: 'absolute',
  top: '50%',
  marginTop: -3,
  width: 6,
  height: 6,
  background: '#888'
};

export default class DualPlaybackControl extends MonochromePlaybackControl {
  static propTypes = {
    ...MonochromePlaybackControl.propTypes,
    lookAhead: PropTypes.number,
    maxLookAhead: PropTypes.number,
    formatLookAhead: PropTypes.func,
    onLookAheadChange: PropTypes.func
  };

  static defaultProps = {
    ...MonochromePlaybackControl.defaultProps,
    lookAhead: 0,
    maxLookAhead: 10000,
    formatLookAhead: String,
    onLookAheadChange: () => {}
  };

  _renderSlider() {
    const mainSlider = super._renderSlider();

    if (this.props.maxLookAhead > 0) {
      const {currentTime, startTime, endTime, lookAhead} = this.props;
      const lookAheadTime = Math.min(currentTime + lookAhead, endTime);
      const lookAheadMarkerStyle = {
        ...LOOKAHEAD_MARKER_STYLE,
        left: `${((lookAheadTime - startTime) * 100) / (endTime - startTime)}%`
      };
      const children = React.Children.toArray(mainSlider.props.children);
      children.push(<div key="lookahead-marker" style={lookAheadMarkerStyle} />);
      return React.cloneElement(mainSlider, null, children);
    }

    return mainSlider;
  }

  _renderControls() {
    const {lookAhead, formatLookAhead, maxLookAhead, step} = this.props;
    const controls = super._renderControls();
    if (maxLookAhead > 0) {
      controls.push(
        <div
          className="mc-playback-control--lookahead"
          style={LOOKAHEAD_CONTAINER_STYLE}
          key="lookahead-slider"
        >
          <div style={LOOKAHEAD_SLIDER_STYLE}>
            <Slider
              value={lookAhead}
              min={0}
              max={maxLookAhead}
              step={step}
              size={16}
              onChange={this.props.onLookAheadChange}
            />
          </div>
          <span>Look ahead: {formatLookAhead(lookAhead)}</span>
        </div>
      );
    }
    return controls;
  }
}
