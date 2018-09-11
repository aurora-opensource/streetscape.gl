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
