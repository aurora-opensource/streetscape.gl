const fs = require('fs');
const path = require('path');

import {getTimestamps, toArrayBuffer} from '../parsers/common';

function loadImageData(filePath) {
  const image_buf = fs.readFileSync(filePath);
  return toArrayBuffer(image_buf);
}

// load file
export class ImageDataSource {
  constructor(directory) {
    this.root_dir = directory;

    this.image_files = {};
    this.image_data_dirs = [];
    this.timestamps = {};

    this.CAMERAS = {
      '/image/00': {
        dir: 'image_00'
      },
      '/image/01': {
        dir: 'image_01'
      },
      '/image/02': {
        dir: 'image_02'
      },
      '/image/03': {
        dir: 'image_03'
      }
    };
  }

  load() {
    const cameras = Object.keys(this.CAMERAS);
    cameras.forEach(cameraName => {
      const camera = this.CAMERAS[cameraName];
      const timeFilePath = path.join(this.root_dir, camera.dir, 'timestamps.txt');
      // TODO load start and end timestamps if necessary
      this.timestamps[camera] = getTimestamps(timeFilePath);

      const image_data_dir = path.join(this.root_dir, camera.dir, 'data');
      this.image_data_dirs[cameraName] = image_data_dir;
      this.image_files[cameraName] = fs.readdirSync(image_data_dir).sort();
    });
  }

  convertFrame(frame_number, xvizBuilder) {
    const i = frame_number;
    const cameras = Object.keys(this.CAMERAS);
    cameras.forEach(cameraName => {
      const camera = this.CAMERAS[cameraName];

      const dataDir = this.image_data_dirs[cameraName];
      const imageFiles = this.image_files[cameraName];
      const srcFilePath = path.resolve(dataDir, imageFiles[frame_number]);

      const image_data = loadImageData(srcFilePath);

      const tmp_obj = {
        height: 375,
        width: 1042,
        format: 'png',
        data: image_data
      };

      xvizBuilder.image(cameraName, tmp_obj).timestamp(this.timestamps[camera][i]);
    });
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;

    Object.keys(this.CAMERAS).forEach(cameraName =>
      xb.camera(cameraName, {
        height: 375,
        width: 1042,
        format: 'png'
      })
    );
  }
}
