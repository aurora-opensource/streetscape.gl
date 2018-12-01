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

import {XVIZFileLoader} from 'streetscape.gl';

function getLogPath(namespace, logName) {
  switch (namespace) {
    case 'kitti':
      return `kitti/2011_09_26/2011_09_26_drive_${logName}_sync`;
    default:
      return null;
  }
}

function getLogFilePath(namespace, logName, index) {
  const logPath = getLogPath(namespace, logName);
  return `${logPath}/${index + 1}-frame.glb`;
}

function getTimingFilePath(namespace, logName) {
  const logPath = getLogPath(namespace, logName);
  return `${logPath}/0-frame.json`;
}

/* eslint-disable no-console, no-undef */
export function getLogLoader(namespace, logName) {
  return new XVIZFileLoader({
    timingsFilePath: getTimingFilePath(namespace, logName),
    getFilePath: index => getLogFilePath(namespace, logName, index),
    worker: true,
    maxConcurrency: 4
  }).on('error', console.error);
}
/* eslint-enable no-console */
