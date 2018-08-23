import Promise from 'bluebird';
import GPSConverter from './gps-converter';
import LidarConverter from './lidar-converter';
import TrackletsConverter from './tracklets-converter';
import RouteConverter from './route-converter';
import PerceptionMarkersConverter from './perception-markers-converter';

import {XVIZMetadataBuilder, XVIZBuilder} from '@xviz/builder';

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

export default class VoyageConverter {
  constructor(disableStreams) {
    this.disableStreams = disableStreams;
    this.converters = [
      new GPSConverter(VGCC),
      new LidarConverter(),
      new TrackletsConverter(),
      new PerceptionMarkersConverter('/perception/markers'),
      new RouteConverter()
    ];

    this.xvizMetadataBuilder = this._initMetadataBuilder();
    this.metadata = this.xvizMetadataBuilder.getMetadata();
  }

  getXVIZMetadataBuilder() {
    return this.xvizMetadataBuilder;
  }

  async convertFrame(frame) {
    // The XVIZBuilder provides a fluent-API to construct objects.
    // This makes it easier to incrementally build objects that may have
    // many different options or variant data types supported.
    const xvizBuilder = new XVIZBuilder(this.metadata, this.disableStreams, {});

    await Promise.map(this.converters, c => c.convertFrame(frame, xvizBuilder));

    return xvizBuilder.getFrame();
  }

  _initMetadataBuilder() {
    const xvizMetadataBuilder = new XVIZMetadataBuilder();
    this.converters.forEach(c => c.getMetadata(xvizMetadataBuilder));

    return xvizMetadataBuilder;
  }
}
