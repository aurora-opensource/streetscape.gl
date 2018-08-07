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

/* global Buffer */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {encodeBinaryXVIZ, parseBinaryXVIZ} = require('@xviz/client');

function getTimestamps(timestampsFilePath) {
  // Read and parse the timestamps
  const content = fs.readFileSync(timestampsFilePath, 'utf8');
  const lines = content.split('\n').filter(Boolean);

  const timestamps = lines.map(line => {
    // Note: original KITTI timestamps give nanoseconds
    const unix = Date.parse(`${line} GMT`);
    return unix;
  });

  return timestamps;
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    // make sure parent exists
    const parent = path.dirname(dirPath);
    createDir(parent);

    fs.mkdirSync(dirPath);
  }
}

function deleteDirRecursive(parentDir) {
  const files = fs.readdirSync(parentDir);
  files.forEach(file => {
    const currPath = path.join(parentDir, file);
    if (fs.lstatSync(currPath).isDirectory()) {
      // recurse
      deleteDirRecursive(currPath);
    } else {
      // delete file
      fs.unlinkSync(currPath);
    }
  });

  fs.rmdirSync(parentDir);
}

function toBuffer(ab) {
  assert(ab instanceof ArrayBuffer);
  const buf = new Buffer(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

function toArrayBuffer(buf) {
  assert(buf instanceof Buffer);
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function packGLB(filePath, inputJson, options = {flattenArrays: false}) {
  const glbFileBuffer = encodeBinaryXVIZ(inputJson, options);
  fs.writeFileSync(`${filePath}.glb`, toBuffer(glbFileBuffer), {flag: 'w'});
  console.log(`Wrote ${filePath}.glb`); // eslint-disable-line
}

function unpackGLB(filePath) {
  const buffer = fs.readFileSync(`${filePath}.glb`);
  const parsed = parseBinaryXVIZ(toArrayBuffer(buffer));
  return parsed;
}

module.exports = {
  createDir,
  deleteDirRecursive,
  getTimestamps,
  packGLB,
  toArrayBuffer,
  unpackGLB,
  toBuffer
};
