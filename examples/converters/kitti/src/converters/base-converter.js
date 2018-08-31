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

import {getTimestamps} from '../parsers/common';

export default class BaseConverter {
  constructor(rootDir, streamDir) {
    // KITTY data streams follow a consistent directory structure
    // root/image_00/data, root/velodyne_points/data
    this.rootDir = rootDir;
    this.streamDir = path.join(this.rootDir, streamDir);
    this.dataDir = path.join(this.streamDir, 'data');
  }

  load() {
    // Load data file names and sort them
    this.fileNames = fs.readdirSync(this.dataDir).sort();

    // Load time stamp table
    const timeFilePath = path.join(this.streamDir, 'timestamps.txt');
    this.timestamps = getTimestamps(timeFilePath);
  }

  loadFrame(frameNumber) {
    // Load the data for this frame
    const fileName = this.fileNames[frameNumber];
    const srcFilePath = path.join(this.dataDir, fileName);
    const data = fs.readFileSync(srcFilePath);

    // Get the time stamp
    const timestamp = this.timestamps[frameNumber];

    return {data, timestamp};
  }
}
