/* eslint-disable no-unused-vars */
import fs from 'fs';

import Bag from './bag';
import UdacityConverter from './converters/udacity-converter';
import {createDir, deleteDirRecursive} from './parsers/common';

const allTopics = [
  '/can_bus_dbw/can_rx',
  '/vehicle/dbw_enabled',
  '/imu/data',
  '/fix',
  '/ecef/',
  '/time_reference',
  '/vehicle/throttle_report',
  '/vehicle/twist_controller/parameter_descriptions',
  '/vehicle/twist_controller/parameter_updates',
  '/vehicle/brake_info_report',
  '/pressure',
  '/vehicle/throttle_info_report',
  '/vehicle/imu/data_raw',
  '/vehicle/suspension_report',
  '/vehicle/wheel_speed_report',
  '/vehicle/joint_states',
  '/vehicle/steering_report',
  '/vehicle/filtered_accel',
  '/vehicle/brake_report',
  '/vehicle/gear_report',
  '/velodyne_packets',
  '/vehicle/misc_1_report',
  '/vehicle/sonar_cloud',
  '/vehicle/surround_report',
  '/vehicle/fuel_level_report',
  '/vehicle/gps/fix',
  '/vehicle/gps/time',
  '/vehicle/gps/vel',
  '/vehicle/tire_pressure_report',
  '/diagnostics',
  '/diagnostics',
  '/diagnostics',
  '/center_camera/camera_info',
  '/center_camera/image_color/compressed',
  '/right_camera/camera_info',
  '/right_camera/image_color/compressed',
  '/left_camera/camera_info',
  '/left_camera/image_color/compressed'
];

module.exports = async function main(args) {
  const {bag: bagPath, outputDir} = args;

  deleteDirRecursive(outputDir);
  createDir(outputDir);

  console.log(`Converting data at ${bagPath}`); // eslint-disable-line
  console.log(`Saving to ${outputDir}`); // eslint-disable-line

  const profileStart = Date.now();

  const keyTopic = '/vehicle/gps/time';

  const selectedTopics = [
    '/imu/data',
    '/vehicle/gps/fix',
    '/vehicle/gps/time',
    '/vehicle/gps/vel',
    '/vehicle/imu/data_raw'
  ];

  const bag = new Bag({
    bagPath,
    topics: selectedTopics,
    keyTopic
  });

  const converter = new UdacityConverter({});

  let frameNum = 0;
  await bag.readFrames(frame => {
    const converted = converter.convertFrame(frame);
    fs.writeFileSync(`${outputDir}/${frameNum}.json`, JSON.stringify(converted, null, 2), 'utf8');
    frameNum++;
  });

  const profileEnd = Date.now();
  console.log(`Generate ${frameNum} frames in ${profileEnd - profileStart}s`); // eslint-disable-line
};
