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

const fs = require('fs');
const path = require('path');

const {packGLB} = require('../parsers/common');

export class XVIZWriter {
  // xvizMetadata is the object returned
  // from a Builder.
  writeMetadata(xvizDirectory, xvizMetadata) {
    const xvizMetadataFilename = path.join(xvizDirectory, '1-frame');
    packGLB(xvizMetadataFilename, xvizMetadata);
    fs.writeFileSync(`${xvizMetadataFilename}.json`, JSON.stringify(xvizMetadata, null, 2), {
      flag: 'w'
    });
  }

  writeFrame(xvizDirectory, frame_number, xvizFrame) {
    // +2 is because 1 is metadata, so we start with 2
    const frameFilePath = path.join(xvizDirectory, `${frame_number + 2}-frame`);
    packGLB(frameFilePath, xvizFrame);

    // fs.writeFileSync(`${frameFilePath}.json`, JSON.stringify(xvizFrame, null, 2), {flag: 'w'});
  }
}
