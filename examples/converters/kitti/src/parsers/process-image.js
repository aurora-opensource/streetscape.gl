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

import fs from 'fs';
import sharp from 'sharp';

function getResizeDimension(width, height, maxWidth, maxHeight) {
  const ratio = width / height;

  let resizeWidth = null;
  let resizeHeight = null;

  if (maxHeight > 0 && maxWidth > 0) {
    resizeWidth = Math.min(maxWidth, maxHeight * ratio);
    resizeHeight = Math.min(maxHeight, maxWidth / ratio);
  } else if (maxHeight > 0) {
    resizeWidth = maxHeight * ratio;
    resizeHeight = maxHeight;
  } else if (maxWidth > 0) {
    resizeWidth = maxWidth;
    resizeHeight = maxWidth / ratio;
  } else {
    resizeWidth = width;
    resizeHeight = height;
  }

  return {
    resizeWidth: Math.floor(resizeWidth),
    resizeHeight: Math.floor(resizeHeight)
  };
}

// preserve aspect ratio
export async function resizeImage(filePath, maxWidth, maxHeight) {
  const metadata = await getImageMetadata(filePath);
  const {width, height} = metadata;

  let imageData = null;
  const {resizeWidth, resizeHeight} = getResizeDimension(width, height, maxWidth, maxHeight);

  if (resizeWidth === width && resizeHeight === height) {
    imageData = fs.readFileSync(filePath);
  } else {
    imageData = await sharp(filePath)
      .resize(resizeWidth, resizeHeight)
      .max()
      .toBuffer()
      .then(data => data);
  }

  return {
    width: resizeWidth,
    height: resizeHeight,
    data: imageData
  };
}

export async function getImageMetadata(filePath) {
  return await sharp(filePath).metadata();
}
