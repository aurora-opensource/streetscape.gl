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
import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';

import {getTimestamps, createDir} from '../parsers/common';
import GPSConverter from './gps-converter';
import LidarConverter from './lidar-converter';
import TrackletsConverter from './tracklets-converter';
import CameraConverter from './camera-converter';
import {getDeclarativeUI} from './declarative-ui';

export class KittiConverter {
  constructor(inputDir, outputDir, {disabledStreams, imageMaxWidth, imageMaxHeight}) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
    this.disabledStreams = disabledStreams;
    this.imageOptions = {
      maxWidth: imageMaxWidth,
      maxHeight: imageMaxHeight
    };

    this.numFrames = 0;
    this.metadata = null;
  }

  initialize() {
    const timestampsFilePath = path.resolve(this.inputDir, 'oxts', 'timestamps.txt');
    this.timestamps = getTimestamps(timestampsFilePath);

    createDir(this.outputDir);

    this.numFrames = this.timestamps.length;

    // These are the converters for the various data sources.
    // Notice that some data sources are passed to others when a data dependency
    // requires coordination with another data source.
    const gpsConverter = new GPSConverter(this.inputDir, 'oxts');

    // Note: order is important due to data deps on the pose
    this.converters = [
      gpsConverter,
      new TrackletsConverter(this.inputDir, i => gpsConverter.getPose(i)),
      new LidarConverter(this.inputDir, 'velodyne_points'),
      new CameraConverter(this.inputDir, {
        disabledStreams: this.disabledStreams,
        options: this.imageOptions
      })
    ];

    this.converters.forEach(converter => converter.load());

    this.metadata = this.getMetadata();
  }

  frameCount() {
    return this.numFrames;
  }

  async convertFrame(frameNumber) {
    // The XVIZBuilder provides a fluent API to construct objects.
    // This makes it easier to incrementally build objects that may have
    // many different options or variant data types supported.
    const xvizBuilder = new XVIZBuilder({
      metadata: this.metadata,
      disabledStreams: this.disabledStreams
    });

    // As builder instance is shared across all the converters, to avoid race conditions',
    // Need wait for each converter to finish
    for (let i = 0; i < this.converters.length; i++) {
      await this.converters[i].convertFrame(frameNumber, xvizBuilder);
    }

    return xvizBuilder.getFrame();
  }

  getMetadata() {
    // The XVIZMetadataBuilder provides a fluent API to collect
    // metadata about the XVIZ streams produced during conversion.
    //
    // This include type, category, and styling information.
    //
    // Keeping this general data centralized makes it easy to find and change.
    const xb = new XVIZMetadataBuilder();
    xb.startTime(this.timestamps[0]).endTime(this.timestamps[this.timestamps.length - 1]);

    this.converters.forEach(converter => converter.getMetadata(xb));

    const metadata = xb.getMetadata();
    // TODO(Xintong): use new MetadataBuilder api to set declarativeUI
    metadata.declarativeUI = getDeclarativeUI();

    return metadata;
  }
}
