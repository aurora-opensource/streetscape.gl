import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import sizeOf from 'image-size';

function scaleImage(inputPath, outFilePath, imageScale) {
  const image = sharp(inputPath);

  image.metadata().then(metadata => {
    const width = Math.floor(Number(imageScale) * Number(metadata.width));
    const height = Math.floor(Number(imageScale) * Number(metadata.height));
    image
      .resize(width, height)
      .toFile(outFilePath)
      .catch(e => {
        console.error(e); // eslint-disable-line
      });
  });
}

function scale(inputDir, outputDir, imageScale) {
  const files = fs.readdirSync(inputDir);
  if (files) {
    files.forEach(fileName => {
      const inputFilePath = path.resolve(inputDir, fileName);
      const outFilePath = path.resolve(outputDir, fileName);
      scaleImage(inputFilePath, outFilePath, imageScale);
    });
  }
}

export function getImageMetadata(imagePath) {
  return sizeOf(imagePath);
}

export function processImage({inputDir, outputDir, cameraSources, imageScale}) {
  if (imageScale !== 1) {
    cameraSources.forEach(cameraDir => {
      const imageInputDir = path.resolve(inputDir, cameraDir, 'data');
      const imageOutputDir = path.resolve(inputDir, cameraDir, 'processed');
      if (!fs.existsSync(imageOutputDir)) {
        fs.mkdirSync(imageOutputDir);
      }
      scale(imageInputDir, imageOutputDir, imageScale);
    });
  }
}
