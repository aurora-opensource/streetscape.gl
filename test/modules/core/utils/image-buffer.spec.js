// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape';

import ImageBuffer from '@streetscape.gl/core/utils/image-buffer';

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
