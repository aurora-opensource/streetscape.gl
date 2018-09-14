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
