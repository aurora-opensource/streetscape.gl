import React, {PureComponent} from 'react';
import {FloatPanel} from 'monochrome-ui';

import ImageSeuqce from './image-sequence';
import connectToLog from './connect';

const DEFAULT_IMAGE_WIDTH = 600;
const DEFAULT_IMAGE_HEIGHT = 400;

class VideoContainer extends PureComponent {
  render() {
    const {imageFrames, currentTime} = this.props;
    if (!currentTime || !imageFrames) {
      return null;
    }

    return (
      <FloatPanel className="vehicle-video-panel" resizable={true}>
        <div>
          {Object.keys(imageFrames).map(imageName => (
            <ImageSeuqce
              key={imageName}
              width={imageFrames[imageName][0].width_px || DEFAULT_IMAGE_WIDTH}
              height={imageFrames[imageName][0].height_px || DEFAULT_IMAGE_HEIGHT}
              src={imageFrames[imageName]}
              currentTime={currentTime / 1000}
            />
          ))}
        </div>
      </FloatPanel>
    );
  }
}

const getLogState = log => ({
  currentTime: log.getCurrentTime(),
  imageStreamNames: log.getImageStreamNames(),
  imageFrames: log.getImageFrames()
});

export default connectToLog({getLogState, Component: VideoContainer});
