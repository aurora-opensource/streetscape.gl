const fs = require('fs');
const path = require('path');

import {getTimestamps, toArrayBuffer} from '../parsers/common';

function loadImageData(filePath) {
  const buf = fs.readFileSync(filePath);
  return toArrayBuffer(buf);
}

export class ImageDataSource {
  constructor(directory) {
    this.root_dir = directory;

    this.image_files = {};
    this.image_data_dirs = [];
    this.timestamps = {};

    this.IMAGE_STREAMS = {
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

  // load file
  load() {
    const streams = Object.keys(this.IMAGE_STREAMS);
    streams.forEach(streamName => {
      const stream = this.IMAGE_STREAMS[streamName];
      const timeFilePath = path.join(this.root_dir, stream.dir, 'timestamps.txt');
      // TODO load start and end timestamps if necessary
      this.timestamps[streamName] = getTimestamps(timeFilePath);

      const image_data_dir = path.join(this.root_dir, stream.dir, 'data');
      this.image_data_dirs[streamName] = image_data_dir;
      this.image_files[streamName] = fs.readdirSync(image_data_dir).sort();
    });
  }

  convertFrame(frame_number, xvizBuilder) {
    const i = frame_number;
    const streams = Object.keys(this.IMAGE_STREAMS);
    streams.forEach(streamName => {
      const dataDir = this.image_data_dirs[streamName];
      const imageFiles = this.image_files[streamName];
      const srcFilePath = path.resolve(dataDir, imageFiles[frame_number]);

      const image_data = loadImageData(srcFilePath);

      xvizBuilder
        .stream(streamName)
        .image({
          heightPixel: 375,
          widthPixel: 1042,
          format: 'png',
          data: image_data
        })
        .timestamp(this.timestamps[streamName][i]);
    });
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;

    Object.keys(this.IMAGE_STREAMS).forEach(streamName =>
      xb
        .stream(streamName)
        .category('primitive')
        .type('image')
    );
  }
}
