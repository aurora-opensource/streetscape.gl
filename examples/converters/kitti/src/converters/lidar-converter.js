const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;

const {encodeBinaryXVIZ} = require('@xviz/builder');
const {parseBinaryXVIZ} = require('@xviz/parser');

import {getTimestamps} from '../parsers/common';

import {loadLidarData} from '../parsers/parse-lidar-points';

// load file
export default class LidarConverter {
  constructor(directory) {
    this.root_dir = directory;
    this.lidar_dir = path.join(directory, 'velodyne_points');
    this.lidar_data_dir = path.join(this.lidar_dir, 'data');
    this.lidar_files = [];

    this.LIDAR_POINTS = '/lidar/points';
  }

  load() {
    const timeFilePath = path.join(this.lidar_dir, 'timestamps.txt');
    // TODO load start and end timestamps if necessary
    this.timestamps = getTimestamps(timeFilePath);

    this.lidar_files = fs.readdirSync(this.lidar_data_dir).sort();
  }

  convertFrame(frameNumber, xvizBuilder) {
    const i = frameNumber;
    const fileName = this.lidar_files[i];
    const srcFilePath = path.join(this.lidar_data_dir, fileName);
    const lidar_contents = fs.readFileSync(srcFilePath);
    const lidar_data = loadLidarData(lidar_contents);

    // This encode/parse is a temporary workaround until we get fine-grain
    // control of which streams should be packed in the binary.
    // By doing this we are able to have the points converted to the appropriate
    // TypedArray, and by unpacking them, they are in a JSON structure that
    // works better with the rest of the conversion.
    const tmp_obj = {vertices: lidar_data.positions};
    const bin_tmp_obj = encodeBinaryXVIZ(tmp_obj, {flattenArrays: true});
    const bin_xviz_lidar = parseBinaryXVIZ(bin_tmp_obj);

    xvizBuilder
      .stream(this.LIDAR_POINTS)
      .points(bin_xviz_lidar.vertices)
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
