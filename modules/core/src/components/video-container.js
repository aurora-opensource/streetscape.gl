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
