import test from 'tape';

import ImageBuffer from 'streetscape.gl/utils/image-buffer';

function TestImageHandler() {
  let loadCount = 0;
  let deleteCount = 0;

  return {
    imageLoader: x => {
      loadCount++;
      return Promise.resolve(x);
    },
    imageDeleter: x => {
      deleteCount++;
    },
    loadCount: () => loadCount,
    deleteCount: () => deleteCount
  };
}

const testFrames = [
  {
    time: 1000,
    images: [{imageData: 'not a real image 1'}]
  },
  {
    time: 1100,
    images: [{imageData: 'not a real image 2'}]
  }
];

test('ImageBuffer#ctor', t => {
  /* eslint-disable no-unused-vars */
  const imageBuffer = new ImageBuffer(3);
  t.end();
});

test('ImageBuffer#set & get frames', t => {
  const imageHandler = TestImageHandler();
  const imageBuffer = new ImageBuffer(3, imageHandler);

  const currentFrame = imageBuffer.set(testFrames, 1000);
  t.equal(currentFrame.imageData, testFrames[0].imageData, 'Returns correct frame');
  t.equal(imageHandler.loadCount(), 2, 'Returns correct load count');

  const frame = imageBuffer.get(currentFrame);
  frame.promise.then(x => {
    t.equal(frame.image.imageData, 'not a real image 1', 'Returns correct data from get()');
    t.end();
  });
});

test('ImageBuffer#set() with timestamp outside range', t => {
  const imageHandler = TestImageHandler();
  const imageBuffer = new ImageBuffer(3, imageHandler);
  const currentFrame = imageBuffer.set(testFrames, 2000);
  t.equal(currentFrame, null, 'Returns null');
  t.equal(imageHandler.loadCount(), 0, 'Returns correct load count');
  t.end();
});

test('ImageBuffer#properly removes cache when bufferedFrames is empty', t => {
  const imageHandler = TestImageHandler();
  const imageBuffer = new ImageBuffer(1, imageHandler);

  const currentFrame = imageBuffer.set(testFrames, 1000);
  t.equal(currentFrame.imageData, testFrames[0].imageData, 'Returns first frame');
  t.equal(imageHandler.loadCount(), 1, 'Returns correct load count');

  const nullFrame = imageBuffer.set(testFrames, 2000);
  t.equal(nullFrame, null, 'Returns null ');
  t.equal(imageHandler.deleteCount(), 1, 'Returns correct delete count');
  t.equal(imageHandler.loadCount(), 1, 'Returns correct load count');

  t.end();
});
