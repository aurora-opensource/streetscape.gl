import React, {PureComponent} from 'react';

import ImageSequence from './image-sequence';
import connectToLog from './connect';

const DEFAULT_IMAGE_WIDTH = 600;
const DEFAULT_IMAGE_HEIGHT = 400;

function getImageDimension(imageFrames) {
  const imageName = Object.keys(imageFrames)[0];
  const width = imageFrames[imageName][0].width_px || DEFAULT_IMAGE_WIDTH;
  const height = imageFrames[imageName][0].height_px || DEFAULT_IMAGE_HEIGHT;
  return {width, height};
}

function getPanelSize(imageWidth, imageHeight, numImages) {
  return {width: imageWidth, height: imageHeight * numImages}
}

class VideoPanel extends PureComponent {
  render() {
    const {imageFrames, currentTime} = this.props;
    if (!currentTime || !imageFrames) {
      return null;
    }

    const numImages = Object.keys(imageFrames).length;
    const {width: imageWidth, height: imageHeight} = getImageDimension(imageFrames);
    const {width, height} = getPanelSize(imageWidth, imageHeight, numImages);
    const paneStyle = {
      width,
      height,
      overflow: 'hidden'
    };

    return (
      <div className="vehicle-video-panel" style={paneStyle}>
          {Object.keys(imageFrames).map(imageName => (
            <ImageSequence
              key={imageName}
              width={imageWidth}
              height={imageHeight}
              src={imageFrames[imageName]}
              currentTime={currentTime / 1000}
            />
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
