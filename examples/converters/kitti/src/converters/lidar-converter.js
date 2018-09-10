const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;

import {getTimestamps} from '../parsers/common';
import {loadLidarData} from '../parsers/parse-lidar-points';

// load file
export default class LidarConverter {
  constructor(directory) {
    this.rootDir = directory;
    this.lidarDir = path.join(directory, 'velodyne_points');
    this.lidarDataDir = path.join(this.lidarDir, 'data');
    this.lidarFiles = [];

    this.LIDAR_POINTS = '/lidar/points';
  }

  load() {
    const timeFilePath = path.join(this.lidarDir, 'timestamps.txt');
    // TODO load start and end timestamps if necessary
    this.timestamps = getTimestamps(timeFilePath);

    this.lidarFiles = fs.readdirSync(this.lidarDataDir).sort();
  }

  async convertFrame(frameNumber, xvizBuilder) {
    const i = frameNumber;
    const fileName = this.lidarFiles[i];
    const srcFilePath = path.join(this.lidarDataDir, fileName);
    const lidarContents = fs.readFileSync(srcFilePath);
    const lidarData = loadLidarData(lidarContents);

    // This encode/parse is a temporary workaround until we get fine-grain
    // control of which streams should be packed in the binary.
    // By doing this we are able to have the points converted to the appropriate
    // TypedArray, and by unpacking them, they are in a JSON structure that
    // works better with the rest of the conversion.
    const temporaryObject = {vertices: lidarData.positions};

    xvizBuilder
      .stream(this.LIDAR_POINTS)
      .points(temporaryObject.vertices)
      .timestamp(this.timestamps[i])
      .id(uuid())
      .color([0, 0, 0, 255]);
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.LIDAR_POINTS)
      .category('primitive')
      .type('point')
      .styleClassDefault({
        fillColor: '#00a',
        radiusPixels: 2
      })
      // laser scanner relative to GPS position
      // http://www.cvlibs.net/datasets/kitti/setup.php
      .pose({
        x: 0.81,
        y: -0.32,
        z: 1.73
      });
  }
}
