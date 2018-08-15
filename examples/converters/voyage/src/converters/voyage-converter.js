import Promise from 'bluebird';
import {GPSDataSource} from './gps-converter';
import {LidarDataSource} from './lidar-converter';
import {TrackletsDataSource} from './tracklets-converter';

import {XVIZBuilder} from '~/xviz-writer';

export class VoyageConverter {
  constructor(disableStreams) {
    this.disableStreams = disableStreams;

    this.converters = [
      new GPSDataSource({
        latitude: 37.3059663,
        longitude: -121.75191,
        altitude: 0
      }),
      new LidarDataSource(),
      new TrackletsDataSource()
    ];
  }

  async convertFrame(frame) {
    // The XVIZBuilder provides a fluent-API to construct objects.
    // This makes it easier to incrementally build objects that may have
    // many different options or variant data types supported.
    const xvizBuilder = new XVIZBuilder(this.disableStreams);

    await Promise.map(this.converters, c => c.convertFrame(frame, xvizBuilder));

    return xvizBuilder.getFrame();
  }

  buildMetadata(xvizMetadataBuilder) {
    this.converters.forEach(c => c.getMetadata(xvizMetadataBuilder));
  }
}
