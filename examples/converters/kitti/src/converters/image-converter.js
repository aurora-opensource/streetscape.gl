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

import path from 'path';

import {resizeImage} from '../parsers/process-image';
import BaseConverter from './base-converter';

export default class ImageConverter extends BaseConverter {
  constructor(rootDir, camera = 'image_00', options) {
    super(rootDir, camera);

    this.streamName = `/camera/${camera}`;
    this.dataDir = path.join(this.streamDir, 'data');

    this.options = options;
  }

  async loadFrame(frameNumber) {
    // Load the data for this frame
    const fileName = this.fileNames[frameNumber];
    const {maxWidth, maxHeight} = this.options;
    const srcFilePath = path.join(this.dataDir, fileName);
    const {data, width, height} = await resizeImage(srcFilePath, maxWidth, maxHeight);

    // Get the time stamp
    const timestamp = this.timestamps[frameNumber];

    return {data, timestamp, width, height};
  }

  async convertFrame(frameNumber, xvizBuilder) {
    const {data, width, height} = await this.loadFrame(frameNumber);

    xvizBuilder
      .primitive(this.streamName)
      .image(nodeBufferToTypedArray(data), 'png')
      .dimensions(width, height);
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.streamName)
      .category('primitive')
      .type('image');
  }
}

function nodeBufferToTypedArray(buffer) {
  // TODO - per docs we should just be able to call buffer.buffer, but there are issues
  const typedArray = new Uint8Array(buffer);
  return typedArray;
}
