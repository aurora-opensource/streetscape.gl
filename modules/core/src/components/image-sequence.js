// @flow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

// The time window within which frames can be attributed to the current timestamp
const TOLERANCE = 0.1;
// Buffer size in seconds around the given timestamp
// This is used to pre-load frames into the DOM tree so that the video plays smoothly
const VIDEO_FRAME_BUFFER = 2;

/* Component that renders image sequence as video */
export default class ImageSequence extends PureComponent {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,

    // Array of frames to render, in shape of {timestamp, imageUrl}
    src: PropTypes.array, // eslint-disable-line

    // Filters
    brightness: PropTypes.number,
    contrast: PropTypes.number,
    saturate: PropTypes.number,
    invert: PropTypes.number,

    currentTime: PropTypes.number.isRequired
  };

  static defaultProps = {
    brightness: 1.0,
    contrast: 1.0,
    saturate: 1.0,
    invert: 0.0,
    src: []
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this._getCurrentFrames(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this._getCurrentFrames(nextProps)
    });
  }

  _getCurrentFrames(props) {
    const {currentTime, src} = props;

    const minBufferTime = currentTime - VIDEO_FRAME_BUFFER;
    const maxBufferTime = currentTime + VIDEO_FRAME_BUFFER;

    const buffer = src.filter(
      frame => frame.timestamp >= minBufferTime && frame.timestamp <= maxBufferTime
    );

    let bestDelta = TOLERANCE;

    // Find the frame closest to the current timestamp
    const currentFrame = buffer.reduce((bestMatch, frame) => {
      const delta = Math.abs(frame.timestamp - currentTime);
      if (delta < bestDelta) {
        bestDelta = delta;
        return frame;
      }
      return bestMatch;
    }, null);

    return {currentFrame, buffer};
  }

  _getVideoFilterCSS = () => {
    const {brightness, contrast, saturate, invert} = this.props;
    const filter = `\
      ${Number.isFinite(brightness) ? `brightness(${brightness}) ` : ''}\
      ${Number.isFinite(saturate) ? `saturate(${saturate}) ` : ''}\
      ${Number.isFinite(contrast) ? `contrast(${contrast}) ` : ''}\
      ${Number.isFinite(invert) ? `invert(${invert}) ` : ''}`;
    return filter;
  };

  _renderFrame = (frame, i) => {
    const isVisible = frame === this.state.currentFrame;

    return (
      <img
        key={frame.timestamp}
        src={frame.imageUrl}
        style={isVisible ? {filter: this._getVideoFilterCSS()} : null}
        className={isVisible ? 'visible' : ''}
      />
    );
  };

  render() {
    const {width, height} = this.props;

    return (
      <div className="vehicle-video" style={{width, height}}>
        {this.state.buffer.map(this._renderFrame)}
      </div>
    );
  }
}
