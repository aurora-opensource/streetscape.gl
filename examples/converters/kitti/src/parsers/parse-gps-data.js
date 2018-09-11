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
 * Parse GPS/IMU data (stored in oxts dir),
 * extract vehicle pose, velocity and acceleration information
 */

// Per dataformat.txt
const OxtsPacket = [
  'lat',
  'lon',
  'alt',
  'roll',
  'pitch',
  'yaw',
  'vn',
  've',
  'vf',
  'vl',
  'vu',
  'ax',
  'ay',
  'az',
  'af',
  'al',
  'au',
  'wx',
  'wy',
  'wz',
  'wf',
  'wl',
  'wu',
  'pos_accuracy',
  'vel_accuracy',
  'navstat',
  'numsats',
  'posmode',
  'velmode',
  'orimode'
];

function getOxtsPacket(oxtsLine) {
  const res = OxtsPacket.reduce((resMap, key, i) => {
    resMap[key] = oxtsLine[i];
    return resMap;
  }, {});

  return res;
}

export function loadOxtsPackets(content) {
  // Generator to read OXTS ground truth data.
  // Poses are given in an East-North-Up coordinate system
  // whose origin is the first GPS position.

  const values = content.split(' ').filter(Boolean);
  // TODO: this should validate the # of fields
  return getOxtsPacket(values);
}
