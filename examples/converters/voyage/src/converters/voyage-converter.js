import Promise from 'bluebird';
import {GPSDataSource} from './gps-converter';
import {LidarDataSource} from './lidar-converter';
import {TrackletsDataSource} from './tracklets-converter';
import {RouteDataSource} from './route-converter';

import {XVIZBuilder} from '~/xviz-writer';

const VGCC = {
  latitude: 37.290493011474609375,
  longitude: -121.753868103027343750,
  altitude: 204.159072875976562500
};

const SPRINGFIELD = {
  latitude: 37.3059663,
  longitude: -121.75191,
  altitude: 0
};

export class VoyageConverter {
  constructor(disableStreams) {
    this.disableStreams = disableStreams;

    this.converters = [
      new GPSDataSource(VGCC),
      new LidarDataSource(),
      new TrackletsDataSource(),
      new RouteDataSource()
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
