/* global createImageBitmap, Blob, Image, URL  */
import {getXVIZSettings} from '@xviz/parser';

/* Loads the image data from a frame of a XVIZ image stream */
function loadImage(frame) {
  const blob = new Blob([frame.imageData], {type: frame.imageType});

  if (typeof createImageBitmap !== 'undefined') {
    return createImageBitmap(blob);
  }
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = URL.createObjectURL(blob);
    } catch (error) {
      reject(error);
    }
  });
}

/* Disposes of all graphical resources associated with the image */
function deleteImage(image) {
  if (image.close) {
    // Is ImageBitmap
    image.close();
  }
}

/* Manages loaded images for a XVIZ image stream */
export default class ImageBuffer {
  constructor(size, {imageLoader = loadImage, imageDeleter = deleteImage} = {}) {
    this.size = size;
    this.imageLoader = imageLoader;
    this.imageDeleter = imageDeleter;
    this.buffer = new Map();
  }

  get(frame) {
    return this.buffer.get(frame);
  }

  set(allFrames, currentTime) {
    const {buffer} = this;

    const {currentFrame, bufferedFrames} = this._getCurrentFrames(allFrames, currentTime);

    // Remove images outside of the buffer range
    for (const frame of buffer.keys()) {
      if (
        bufferedFrames.length === 0 ||
        frame.timestamp < bufferedFrames[0].timestamp ||
        frame.timestamp > bufferedFrames[bufferedFrames.length - 1].timestamp
      ) {
        this.imageDeleter(buffer.get(frame));
        buffer.delete(frame);
      }
    }

    // Load images for frames in the buffer
    bufferedFrames.forEach(frame => {
      if (!buffer.has(frame)) {
        const data = {};

        data.promise = this.imageLoader(frame).then(image => {
          data.image = image;
          return image;
        });

        buffer.set(frame, data);
      }
    });

    return currentFrame;
  }

  _getCurrentFrames(allFrames, currentTime) {
    let currentFrame = null;
    let currentFrameIndex = -1;
    let bestDelta = getXVIZSettings().TIME_WINDOW;

    // Find the frame closest to the current timestamp
    allFrames.forEach((frame, i) => {
      const delta = currentTime - frame.timestamp;
      if (delta >= 0 && delta < bestDelta) {
        bestDelta = delta;
        currentFrame = frame;
        currentFrameIndex = i;
      }
    });

    // Load adjacent frames into the buffer
    const bufferedFrames =
      currentFrameIndex >= 0
        ? allFrames.slice(Math.max(0, currentFrameIndex - this.size), currentFrameIndex + this.size)
        : [];

    return {currentFrame, bufferedFrames};
  }
}
