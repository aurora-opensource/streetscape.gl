import {GPSDataSource} from './gps-converter';
import {LidarDataSource} from './lidar-converter';

import {XVIZBuilder} from '../xviz-writer';

export class VoyageConverter {
  constructor(disableStreams) {
    this.disableStreams = disableStreams;
    this.gpsDataSource = new GPSDataSource();
    this.lidarDataSource = new LidarDataSource();

    this.converters = [this.gpsDataSource, this.lidarDataSource];
  }

  convertFrame(frame) {
    // The XVIZBuilder provides a fluent-API to construct objects.
    // This makes it easier to incrementally build objects that may have
    // many different options or variant data types supported.
    const xvizBuilder = new XVIZBuilder(this.disableStreams);

    this.converters.forEach(c => c.convertFrame(frame, xvizBuilder));

    return xvizBuilder.getFrame();
  }

  buildMetadata(xvizMetadataBuilder) {
    this.converters.forEach(c => c.getMetadata(xvizMetadataBuilder));
  }
}
