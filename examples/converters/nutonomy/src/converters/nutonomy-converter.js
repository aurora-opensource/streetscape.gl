/* eslint-disable camelcase */
import assert from 'assert';
import {createDir, parseJsonFile, toMap} from '../common';

import GPSConverter from './gps-converter';
import ObjectsConverter from './objects-converter';
import LidarConverter from './lidar-converter';
import CameraConverter from './camera-converter';

import {XVIZBuilder, XVIZMetadataBuilder} from '@xviz/builder';
import RandomDataGenerator from './random-data-generator';
import {getDeclarativeUI} from './declarative-ui';

export default class NuTonomyConverter {
  constructor(
    inputDir,
    outputDir,
    samplesDir,
    {disabledStreams, fakeStreams, sceneName, imageMaxWidth, imageMaxHeight}
  ) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
    this.samplesDir = samplesDir;
    this.disabledStreams = disabledStreams;
    this.sceneName = sceneName;
    this.fakeStreams = fakeStreams;
    this.imageMaxWidth = imageMaxWidth;
    this.imageMaxHeight = imageMaxHeight;

    this.metadata = null;
  }

  initialize() {
    this.load();

    createDir(this.outputDir);

    // These are the converters for the various data sources.
    // Notice that some data sources are passed to others when a data dependency
    // requires coordination with another data source.
    const gpsConverter = new GPSConverter(this.inputDir, 'ego_pose.json');
    const objectConverter = new ObjectsConverter(this.inputDir, 'sample_annotation.json');
    const lidarConverter = new LidarConverter(this.samplesDir, 'LIDAR_TOP');
    const cameraConverter = new CameraConverter(this.samplesDir, {
      disabledStreams: this.disabledStreams,
      imageMaxWidth: this.imageMaxWidth,
      imageMaxHeight: this.imageMaxHeight
    });

    // Note: order is important due to data deps on the pose
    this.converters = [gpsConverter, objectConverter, lidarConverter, cameraConverter];

    if (this.fakeStreams) {
      this.converters.push(new RandomDataGenerator());
      // this.converters.push(
      //   new FutureTrackletsConverter(this.inputDir, () => gpsConverter.getPoses(), this.timestamps)
      // );
    }

    gpsConverter.load({
      frames: this.frames,
      categories: this.categories,
      instances: this.instances
    });

    this.converters.filter(converter => converter !== gpsConverter).forEach(converter =>
      converter.load({
        frames: this.frames,
        categories: this.categories,
        instances: this.instances,
        posesByFrame: gpsConverter.getPoses()
      })
    );

    this.metadata = this.getMetadata();
  }

  load() {
    this._loadCategories();
    this._loadInstances();

    this._loadSensors();
    this._loadScenes();

    // from here, loader depend on the previous loaders
    this._loadFrames();
    this._loadFramesData();
    this._loadSensorCalibrations();
  }

  async convertFrame(frame) {
    const frameToken = frame.token;

    const xvizBuilder = new XVIZBuilder({
      metadata: this.metadata,
      disabledStreams: this.disabledStreams
    });

    // As builder instance is shared across all the converters, to avoid race conditions,
    // Need wait for each converter to finish
    for (let i = 0; i < this.converters.length; i++) {
      await this.converters[i].convertFrame(frameToken, xvizBuilder);
    }

    return xvizBuilder.getFrame();
  }

  getFrames() {
    return this.frames;
  }

  frameCount() {
    return this.frames.length;
  }

  getCategories() {
    return this.categories;
  }

  getMetadata() {
    // The XVIZMetadataBuilder provides a fluent API to collect
    // metadata about the XVIZ streams produced during conversion.
    //
    // This include type, category, and styling information.
    //
    // Keeping this general data centralized makes it easy to find and change.
    const xb = new XVIZMetadataBuilder();

    this.converters.forEach(converter =>
      converter.getMetadata(xb, {
        categories: this.categories,
        sensorCalibrations: this.sensorCalibrations
      })
    );

    const timestamps = this.timestamps;
    xb.startTime(timestamps[0]).endTime(timestamps[timestamps.length - 1]);
    xb.ui(getDeclarativeUI());

    const metadata = xb.getMetadata();

    return metadata;
  }

  _loadScenes() {
    const scenes = parseJsonFile(this.inputDir, 'scene.json');
    this.scenes = toMap(scenes, 'name');
  }

  _loadFrames() {
    const allSamples = parseJsonFile(this.inputDir, 'sample.json');
    const samplesByToken = toMap(allSamples, 'token');

    const {first_sample_token: firstSampleToken, last_sample_token: lastSampleToken} = this.scenes[
      this.sceneName
    ];

    this.frames = [];

    // sample of first frame
    let sample = samplesByToken[firstSampleToken];
    // retrieve samples until next token is empty
    while (sample.next) {
      this.frames.push(sample);
      const nextToken = sample.next;
      sample = samplesByToken[nextToken];
    }
    // sample of last frame
    if (sample) {
      this.frames.push(sample);
    }
    assert(sample.token === lastSampleToken);

    this.timestamps = this.frames.map(frame => frame.timestamp / 1000);
    this.numFrames = this.timestamps.length;
  }

  // decorate calibrated sensors with sensor metadata (modality, channel)
  _getCalibratedSensors(firstFrameData, sampleDataByToken) {
    /**
     * sensorsMetadata
     * {
     *   LIDAR_TOP: {calibrated_sensor_token, filename, ego_pose_token, modality, channel}
     *   ...
     * }
     */
    const sensorsMetadata = {};

    // 1 lidar, 6 radars, 6 cameras
    const lidarSamples = firstFrameData.filter(data => data.filename.indexOf('LIDAR') !== -1);
    const cameraSamples = firstFrameData.filter(data => data.filename.indexOf('CAM') !== -1);
    const radarSamples = firstFrameData.filter(data => data.filename.indexOf('RADAR') !== -1);
    const sensorSamples = [...lidarSamples, ...radarSamples, ...cameraSamples];

    const loadSensorsMetadata = sample => {
      const sensor = this.sensors[sample.calibrated_sensor_token];
      if (!sensorsMetadata[sensor.channel]) {
        sensorsMetadata[sensor.channel] = [];
      }
      sensorsMetadata[sensor.channel].push({
        calibrated_sensor_token: sample.calibrated_sensor_token,
        filename: sample.filename,
        ego_pose_token: sample.ego_pose_token,
        sensor_token: sensor.sensor_token,
        modality: sensor.modality,
        channel: sensor.channel
      });
    };

    // first frame
    sensorSamples.forEach(sample => {
      loadSensorsMetadata(sample);
    });

    // for each sensor
    sensorSamples.forEach(sample => {
      // load metadata for the rest of frames
      while (sample) {
        sample = sampleDataByToken[sample.next];

        if (sample) {
          // find next keyframe
          while (!sample.is_key_frame) {
            sample = sampleDataByToken[sample.next];
          }

          loadSensorsMetadata(sample);
        }
      }
    });

    Object.keys(sensorsMetadata).forEach(channel =>
      assert(sensorsMetadata[channel].length === this.frames.length)
    );

    return sensorsMetadata;
  }

  _loadSensorCalibrations() {
    const firstFrameSensors = this.frames[0].sensors;
    const sensorCalibrations = Object.keys(firstFrameSensors).map(channel => {
      const sensorToken = firstFrameSensors[channel].calibrated_sensor_token;
      return this.sensors[sensorToken];
    });
    this.sensorCalibrations = toMap(sensorCalibrations, 'channel');
  }

  _loadFramesData() {
    const sampleData = parseJsonFile(this.inputDir, 'sample_data.json');
    const sampleDataByToken = toMap(sampleData, 'token');

    // find first LIDAR keyframe
    const firstFrameData = sampleData.filter(
      data => data.sample_token === this.frames[0].token && Boolean(data.is_key_frame)
    );

    const sensorsMetadata = this._getCalibratedSensors(firstFrameData, sampleDataByToken);

    this.frames.forEach((frame, i) => {
      // attach sensors for each frame
      const frameSensors = Object.keys(sensorsMetadata).map(channel => sensorsMetadata[channel][i]);
      frame.sensors = toMap(frameSensors, 'channel');
      // use lidar data's ego_pose because
      // A sample is data collected at (approximately) the same timestamp as part of a single LIDAR sweep.
      // https://github.com/nutonomy/nuscenes-devkit/blob/master/schema.md#sample
      frame.ego_pose_token = sensorsMetadata.LIDAR_TOP[i].ego_pose_token;
    });
  }

  _loadCategories() {
    const categories = parseJsonFile(this.inputDir, 'category.json');
    this.categories = toMap(categories, 'token', category => {
      category.streamName = `/${category.name.replace(/\./g, '/')}`;
      return category;
    });
  }

  _loadInstances() {
    const instances = parseJsonFile(this.inputDir, 'instance.json');
    this.instances = toMap(instances, 'token', instance => {
      const category = this.categories[instance.category_token];
      instance.category = category.streamName;
      return instance;
    });
  }

  _loadSensors() {
    let sensors = parseJsonFile(this.inputDir, 'sensor.json');
    sensors = toMap(sensors, 'token');

    const calibratedSensors = parseJsonFile(this.inputDir, 'calibrated_sensor.json');
    this.sensors = toMap(calibratedSensors, 'token');
    Object.keys(this.sensors).forEach(token => {
      const sensorToken = this.sensors[token].sensor_token;
      // add sensor metadata
      this.sensors[token].modality = sensors[sensorToken].modality;
      this.sensors[token].channel = sensors[sensorToken].channel;
    });
  }
}
