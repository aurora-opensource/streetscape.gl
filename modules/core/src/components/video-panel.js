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

import ImageSequence from './image-sequence';
import connectToLog from './connect';

import {normalizeStreamFilter} from '../utils/stream-utils';

const CONTAINER_STYLE = {
  background: '#000'
};

class VideoPanel extends PureComponent {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    streamFilter: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
  };

  _getVideos() {
    const {imageFrames} = this.props;

    if (!imageFrames) {
      return null;
    }

    const streamFilter = normalizeStreamFilter(this.props.streamFilter);

    return Object.keys(imageFrames)
      .filter(streamFilter)
      .map(streamName => ({
        streamName,
        frames: imageFrames[streamName]
      }));
  }

  render() {
    const {currentTime, width} = this.props;
    const videos = this._getVideos();

    if (!currentTime || !videos) {
      return null;
    }

    return (
      <div style={CONTAINER_STYLE}>
        {videos.map(({streamName, frames}) => (
          <ImageSequence width={width} key={streamName} src={frames} currentTime={currentTime} />
        ))}
      </div>
    );
  }
}

const getLogState = log => ({
  currentTime: log.getCurrentTime(),
  imageStreamNames: log.getImageStreamNames(),
  imageFrames: log.getImageFrames()
});

export default connectToLog({getLogState, Component: VideoPanel});
