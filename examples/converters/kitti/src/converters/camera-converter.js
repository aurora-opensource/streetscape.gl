import ImageConverter from './image-converter';

const CAMERA_SOURCES = ['image_00', 'image_01', 'image_02', 'image_03'];

export default class CameraConverter {
  constructor(rootDir, disableStreams = []) {
    this.rootDir = rootDir;
    this.cameraSources = CAMERA_SOURCES.filter(camera => !disableStreams.includes(camera));
    this.imageConverters = [];
  }

  load() {
    this.cameraSources.forEach(cameraSource => {
      this.imageConverters.push(new ImageConverter(this.rootDir, cameraSource));
    });

    this.imageConverters.forEach(imageConverter => imageConverter.load());
  }

  convertFrame(frameNumber, xvizBuilder) {
    this.imageConverters.forEach(imageConverter =>
      imageConverter.convertFrame(frameNumber, xvizBuilder)
    );
  }

  getMetadata(xvizMetaBuilder) {
    this.imageConverters.forEach(imageConverter => imageConverter.getMetadata(xvizMetaBuilder));
  }
}
