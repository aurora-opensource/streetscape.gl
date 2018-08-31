import BaseConverter from './base-converter';

const widthPixel = 1242;
const heightPixel = 375;
const format = 'png';

export default class ImageConverter extends BaseConverter {
  constructor(rootDir, camera = 'image_00') {
    super(rootDir, camera);

    this.streamName = `/camera/${camera}`;
  }

  convertFrame(frameNumber, xvizBuilder) {
    const {data, timestamp} = this.loadFrame(frameNumber);

    xvizBuilder
      .stream(this.streamName)
      .image(nodeBufferToTypedArray(data), format)
      .dimensions(widthPixel, heightPixel)
      .timestamp(timestamp);
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
