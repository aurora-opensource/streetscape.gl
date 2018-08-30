import BaseConverter from './base-converter';

// Load one image file
export default class ImageConverter extends BaseConverter {
  constructor(rootDir, camera = 'image_01') {
    super(rootDir, camera);

    this.streamName = `/camera/${camera}`;
  }

  convertFrame(frameNumber, xvizBuilder) {
    const {data, timestamp} = this.loadFrame(frameNumber);

    xvizBuilder
      .image(this.streamName, nodeBufferToTypedArray(data))
      .timestamp(timestamp);
  }

  getMetadata(xvizMetaBuilder) {
    xvizMetaBuilder
      // .camera(this.streamName, {})
      .type('image');
  }
}

function nodeBufferToTypedArray(buffer) {
  // TODO - per docs we should just be able to call buffer.buffer, but there are issues
  const typedArray = new Uint8Array(buffer);
  return typedArray;
}
