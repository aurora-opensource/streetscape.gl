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

/**
 * Parse LiDar data (stored in velodyne_points dir),
 */

const BinaryParser = require('binary-parser').Parser;
const fs = require('fs');
const uuid = require('uuid').v4;
const parser = new BinaryParser().floatle();
const path = require('path');

const {getTimestamps, packGLB} = require('./common');

function loadTimestamps(timestampsFile) {
  return getTimestamps(timestampsFile);
}

function readBinaryFile(file) {
  const binary = fs.readFileSync(file);
  const res = [];
  for (let i = 0; i < binary.length; i = i + 4) {
    if (i + 4 > binary.length) {
      break;
    }
    const parsed = parser.parse(binary.slice(i, i + 4));
    res.push(parsed);
  }
  return res;
}

function loadLidarData(filePath) {
  const binary = readBinaryFile(filePath);
  const float = new Float32Array(binary);
  const size = Math.round(binary.length / 4);

  // We could return interleaved buffers, no conversion!
  const positions = new Float32Array(3 * size);
  const reflectance = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    positions[i * 3 + 0] = float[i * 4 + 0];
    positions[i * 3 + 1] = float[i * 4 + 1];
    // height of laser scanner
    // http://www.cvlibs.net/datasets/kitti/setup.php
    positions[i * 3 + 2] = float[i * 4 + 2] + 1.73;
    reflectance[i] = float[i * 4 + 3];
  }
  return {positions, reflectance};
}

function generateFile(filePath, inputJson, format = 'glb') {
  switch (format) {
    case 'glb':
      packGLB(filePath, inputJson, {flattenArrays: true});
      // this no longer exists, not sure what it did yet
      // unpack(filePath);
      break;
    default:
      fs.writeFileSync(`${filePath}.json`, JSON.stringify(inputJson), {flag: 'w'});
  }
}

function processSingleFrame(srcFilePath, dstFilePath, timestamp) {
  console.log(`Lidar processing: ${srcFilePath}`); // eslint-disable-line
  const {positions} = loadLidarData(srcFilePath);
  const formattedData = [
    {
      timestamp,
      id: uuid(),
      type: 'points3d',
      color: [0, 0, 0, 255],
      vertices: positions
    }
  ];
  generateFile(dstFilePath, formattedData, 'glb');
}

function parse(originDataPath, getPath) {
  const timeFilePath = path.join(originDataPath, 'velodyne_points', 'timestamps.txt');
  // TODO load start and end timestamps if necessary
  const timestamps = loadTimestamps(timeFilePath);
  const lidarDirPath = path.join(originDataPath, 'velodyne_points', 'data');
  const lidarDataFiles = fs.readdirSync(lidarDirPath).sort();
  lidarDataFiles.forEach((fileName, i) => {
    console.log(`processing lidar data frame ${i}/${timestamps.length}`); // eslint-disable-line
    const srcFilePath = `${lidarDirPath}/${fileName}`;
    const dstFilePath = path.join(getPath(i), 'lidar-points');
    processSingleFrame(srcFilePath, dstFilePath, timestamps[i]);
  });
}

module.exports = parse;
