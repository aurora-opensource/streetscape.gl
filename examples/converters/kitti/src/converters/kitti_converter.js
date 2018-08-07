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

const path = require('path');

const {getTimestamps, createDir} = require('../parsers/common');

import {GPSDataSource} from './gps_converter';
import {LidarDataSource} from './lidar_converter';
import {TrackletsDataSource} from './tracklets_converter';

import {XVIZBuilder, XVIZMetadataBuilder} from '../xviz-writer';

export class KittiConverter {
  constructor(inputDir, outputDir, disableStreams) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
    this.disableStreams = disableStreams;

    this.numFrames = 0;

    this.initialize();
  }

  initialize() {
    const timestampsFilePath = path.resolve(this.inputDir, 'oxts', 'timestamps.txt');
    this.timestamps = getTimestamps(timestampsFilePath);

    createDir(this.outputDir);

    this.numFrames = this.timestamps.length;

    // These are the converters for the various data sources.
    // Notice that some data sources are passed to others when a data dependency
    // requires coordination with another data source.
    this.gps_ds = new GPSDataSource(this.inputDir);
    this.lidar_ds = new LidarDataSource(this.inputDir);
    this.tracklet_ds = new TrackletsDataSource(this.inputDir, i => this.gps_ds.getPose(i));

    // Note: order is important due to data deps on the pose
    this.converters = [this.gps_ds, this.lidar_ds, this.tracklet_ds];

    this.converters.forEach(c => c.load());
  }

  frameCount() {
    return this.numFrames;
  }

  convertFrame(frame_number) {
    const i = frame_number;

    // The XVIZBuilder provides a fluent-API to construct objects.
    // This makes it easier to incrementally build objects that may have
    // many different options or variant data types supported.
    const xvizBuilder = new XVIZBuilder(this.disableStreams);

    this.converters.forEach(c => c.convertFrame(i, xvizBuilder));

    return xvizBuilder.getFrame();
  }

  getMetadata() {
    // The XVIZMetadataBuilder provides a fluent-API to collect
    // metadata about the XVIZ streams produced during conversion.
    //
    // This include type, category, and styling information.
    //
    // Keeping this general data centralized makes it easy to find and change.
    const xb = new XVIZMetadataBuilder();
    xb.startTime(this.timestamps[0]).endTime(this.timestamps[this.timestamps.length - 1]);

    this.converters.forEach(c => c.getMetadata(xb));

    return xb.getMetadata();
  }
}
