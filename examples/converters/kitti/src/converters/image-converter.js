import BaseConverter from './base-converter';

// Load one image file
export default class ImageConverter extends BaseConverter {
  constructor(rootDir, camera = 'image_01') {
    super(rootDir, camera);

    this.streamName = `/camera/${camera}`;
  }

  convertFrame(frameNumber, xvizBuilder) {
    const {timestamp} = this.loadFrame(frameNumber);
    // const {data, timestamp} = this.loadFrame(frameNumber);

    xvizBuilder
      .stream(this.streamName)
      // .image(data)
      .timestamp(timestamp);
  }

  getMetadata(xvizMetaBuilder) {
    xvizMetaBuilder
      .stream(this.streamName)
      .category('image')
      .type('image');
  }
}
