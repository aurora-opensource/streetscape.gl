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
import {getXvizSettings} from '@xviz/parser';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

// Buffer size in seconds around the given timestamp
// This is used to pre-load frames into the DOM tree so that the video plays smoothly
const VIDEO_FRAME_BUFFER = 10;

const CONTAINER_STYLE = {
  position: 'relative',
  background: '#000',
  lineHeight: 0
};

/* Component that renders image sequence as video */
export default class ImageSequence extends PureComponent {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

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
    const {currentTime, src} = props;

    let currentFrame = null;
    let currentFrameIndex = -1;
    let bestDelta = getXvizSettings().TIME_WINDOW;

    // Find the frame closest to the current timestamp
    src.forEach((frame, i) => {
      const delta = currentTime - frame.timestamp;
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        currentFrame = frame;
        currentFrameIndex = i;
      }
    });

    const buffer =
      currentFrameIndex >= 0
        ? src.slice(
            Math.max(0, currentFrameIndex - VIDEO_FRAME_BUFFER),
            currentFrameIndex + VIDEO_FRAME_BUFFER
          )
        : // If no frame is matched, still render an invisible placeholder so that the container has size
          src.slice(0, 1);

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
