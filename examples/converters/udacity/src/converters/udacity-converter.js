import {createDir} from '../parsers/common';
import GPSConverter from './gps-converter';

import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';

export default class UDacityConverter {
  constructor(inputFile, outputDir, {disableStreams = []}) {
    this.inputFile = inputFile;
    this.outputDir = outputDir;
    this.disableStreams = disableStreams;

    this.metadata = null;

    this.initialize();
  }

  getRawData(frameNumber, data) {
    // Only extract message from each stream (topic)
    // `message` is the parsed data from `data` (binary)
    const streams = Object.keys(data);
    streams
      .filter(streamName => !this.disableStreams.includes(streamName))
      .forEach(streamName => (data[streamName] = data[streamName].message));
    return data;
  }

  initialize() {
    createDir(this.outputDir);

    this.converters = [new GPSConverter()];

    this.metadata = this.getMetadata();
  }

  convertFrame(frameNumber, data) {
    const xvizBuilder = new XVIZBuilder({});

    this.converters.forEach(converter => converter.convertFrame(frameNumber, data, xvizBuilder));

    return xvizBuilder.getFrame();
  }

  getMetadata(metadataBuilder) {
    // The XVIZMetadataBuilder provides a fluent API to collect
    // metadata about the XVIZ streams produced during conversion.
    //
    // This include type, category, and styling information.
    //
    // Keeping this general data centralized makes it easy to find and change.
    const xb = metadataBuilder || new XVIZMetadataBuilder();

    this.converters.forEach(converter => converter.getMetadata(xb));

    const metadata = xb.getMetadata();

    return metadata;
  }
}
