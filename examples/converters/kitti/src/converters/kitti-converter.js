const path = require('path');

const {getTimestamps, createDir} = require('../parsers/common');

import GPSDataSource from './gps-converter';
import LidarDataSource from './lidar-converter';
import TrackletsDataSource from './tracklets-converter';

import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';

export class KittiConverter {
  constructor(inputDir, outputDir, disableStreams) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
    this.disableStreams = disableStreams;

    this.numFrames = 0;
    this.metadata = null;

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
    const gpsDataSource = new GPSDataSource(this.inputDir);

    // Note: order is important due to data deps on the pose
    this.converters = [
      gpsDataSource,
      new TrackletsDataSource(this.inputDir, i => gpsDataSource.getPose(i)),
      new LidarDataSource(this.inputDir)
    ];

    this.converters.forEach(converter => converter.load());

    this.metadata = this.getMetadata();
  }

  frameCount() {
    return this.numFrames;
  }

  convertFrame(frameNumber) {
    // The XVIZBuilder provides a fluent API to construct objects.
    // This makes it easier to incrementally build objects that may have
    // many different options or variant data types supported.
    const xvizBuilder = new XVIZBuilder({
      metadata: this.metadata,
      disableStreams: this.disableStreams
    });

    this.converters.forEach(converter => converter.convertFrame(frameNumber, xvizBuilder));

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

    return xb.getMetadata();
  }
}
