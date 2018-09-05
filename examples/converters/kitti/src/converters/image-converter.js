import path from 'path';
import fs from 'fs';

import {getImageMetadata} from '../parsers/process-image';
import BaseConverter from './base-converter';

export default class ImageConverter extends BaseConverter {
  constructor(rootDir, camera = 'image_00') {
    super(rootDir, camera);

    this.streamName = `/camera/${camera}`;
    this.dataDir = this._getDataDir();
    this.imageInfo = this._getImageInfo();
  }

  _getDataDir() {
    let dataDir = path.join(this.streamDir, 'processed');
    if (!fs.existsSync(dataDir)) {
      dataDir = path.join(this.streamDir, 'data');
    }
    return dataDir;
  }

  _getImageInfo() {
    const files = fs.readdirSync(this.dataDir);
    if (files) {
      const imageFile = path.join(this.dataDir, files[0]);
      return getImageMetadata(imageFile);
    }
    return null;
  }

  convertFrame(frameNumber, xvizBuilder) {
    const {data} = this.loadFrame(frameNumber);
    const {width: widthPixel, height: heightPixel, type: format} = this.imageInfo;

    xvizBuilder
      .stream(this.streamName)
      .image(nodeBufferToTypedArray(data), format)
      .dimensions(widthPixel, heightPixel);
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.streamName)
      .category('primitive')
      .type('image');
  }
}

function nodeBufferToTypedArray(buffer) {
  // TODO - per docs we should just be able to call buffer.buffer, but there are issues
  const typedArray = new Uint8Array(buffer);
  return typedArray;
}
