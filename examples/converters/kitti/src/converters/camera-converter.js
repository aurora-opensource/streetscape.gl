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

import ImageConverter from './image-converter';

const CAMERA_SOURCES = ['image_00', 'image_01', 'image_02', 'image_03'];

export default class CameraConverter {
  constructor(rootDir, {disabledStreams = [], options = {}}) {
    this.rootDir = rootDir;
    this.cameraSources = CAMERA_SOURCES.filter(camera => !disabledStreams.includes(camera));
    this.imageConverters = [];
    this.options = options;
  }

  load() {
    this.cameraSources.forEach(cameraSource => {
      this.imageConverters.push(new ImageConverter(this.rootDir, cameraSource, this.options));
    });

    this.imageConverters.forEach(imageConverter => imageConverter.load());
  }

  async convertFrame(frameNumber, xvizBuilder) {
    const promises = this.imageConverters.map(imageConverter =>
      imageConverter.convertFrame(frameNumber, xvizBuilder)
    );

    await Promise.all(promises);
  }

  getMetadata(xvizMetaBuilder) {
    this.imageConverters.forEach(imageConverter => imageConverter.getMetadata(xvizMetaBuilder));
  }
}
