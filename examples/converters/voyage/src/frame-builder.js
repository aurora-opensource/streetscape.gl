import Promise from 'bluebird';
import GPSConverter from '~/converters/gps-converter';
import LidarConverter from '~/converters/lidar-converter';
import TrackletsConverter from '~/converters/tracklets-converter';
import RouteConverter from '~/converters/route-converter';
import PerceptionMarkersConverter from '~/converters/perception-markers-converter';
import TrajectoryCircleConverter from '~/converters/trajectory-circle-converter';

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

export default class FrameBuilder {
  constructor({frameIdToPoseMap, disableStreams}) {
    this.disableStreams = disableStreams;
    this.converters = [
      new GPSConverter(SPRINGFIELD),
      new LidarConverter('/lidar/points'),
      new TrackletsConverter('/tracklets/objects'),
      new PerceptionMarkersConverter('/perception/markers'),
      new TrajectoryCircleConverter('/trajectory-circle/markers'),
      new RouteConverter('/map/route')
    ];

    this.xvizMetadataBuilder = this._initMetadataBuilder(frameIdToPoseMap);
    this.metadata = this.xvizMetadataBuilder.getMetadata();
  }

  getXVIZMetadataBuilder() {
    return this.xvizMetadataBuilder;
  }

  async buildFrame(frame) {
    const xvizBuilder = new XVIZBuilder(this.metadata, this.disableStreams, {});
    await Promise.map(this.converters, c => c.convertFrame(frame, xvizBuilder));

    return xvizBuilder.getFrame();
  }

  _initMetadataBuilder(frameIdToPoseMap) {
    const xvizMetadataBuilder = new XVIZMetadataBuilder();
    this.converters.forEach(c => c.getMetadata(xvizMetadataBuilder, frameIdToPoseMap));

    return xvizMetadataBuilder;
  }
}
