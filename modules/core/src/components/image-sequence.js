// @flow
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

// Buffer size in seconds around the given timestamp
// This is used to pre-load frames into the DOM tree so that the video plays smoothly
const VIDEO_FRAME_BUFFER = 10;

const CONTAINER_STYLE = {
  position: 'relative',
  lineHeight: 0
};

/* Component that renders image sequence as video */
export default class ImageSequence extends PureComponent {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    // The time window within which frames can be attributed to the current timestamp
    tolerance: PropTypes.number,

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
    width: '100%',
    height: 'auto',
    // brightness: 1.0,
    // contrast: 1.0,
    // saturate: 1.0,
    // invert: 0.0,
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
    const {currentTime, src, tolerance = Infinity} = props;

    const minBufferTime = currentTime - tolerance * VIDEO_FRAME_BUFFER;
    const maxBufferTime = currentTime + tolerance * VIDEO_FRAME_BUFFER;

    const buffer = src.filter(
      (frame, i) =>
        i === 0 || (frame.timestamp >= minBufferTime && frame.timestamp <= maxBufferTime)
    );

    let bestDelta = tolerance;

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
    if (!frame) {
      return null;
    }

    const {width, height} = this.props;
    const isVisible = frame === this.state.currentFrame;

    const style = {width, height, left: 0, top: 0};

    if (i > 0) {
      style.position = 'absolute';
    }

    if (isVisible) {
      style.filter = this._getVideoFilterCSS();
    } else if (i === 0) {
      // the first image is always displayed for the container to have the correct size
      style.visibility = 'hidden';
    } else {
      style.display = 'none';
    }

    return <img key={frame.timestamp} src={frame.imageUrl} style={style} />;
  };

  render() {
    return <div style={CONTAINER_STYLE}>{this.state.buffer.map(this._renderFrame)}</div>;
  }
}
