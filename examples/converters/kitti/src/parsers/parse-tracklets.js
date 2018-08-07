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
 * Parse tracklets objects (stored in tracklet_labels.xml),
 */
const fs = require('fs');
const parser = require('xml2json');
const path = require('path');
const uuid = require('uuid').v4;
const {_Pose: Pose} = require('math.gl');

function loadTracklets(trackletFilePath) {
  const xml = fs.readFileSync(trackletFilePath, 'utf8');
  const json = JSON.parse(parser.toJson(xml));

  const timeslices = [];

  json.boost_serialization.tracklets.item.forEach(item => {
    const itemProps = {
      id: uuid(),
      objectType: item.objectType,
      width: Number(item.w),
      height: Number(item.h),
      length: Number(item.l)
    };
    const bounds = [
      [-item.l / 2, -item.w / 2],
      [-item.l / 2, item.w / 2],
      [item.l / 2, item.w / 2],
      [item.l / 2, -item.w / 2],
      [-item.l / 2, -item.w / 2]
    ];
    let frameIndex = item.first_frame;

    item.poses.item.forEach(pose => {
      timeslices[frameIndex] = timeslices[frameIndex] || [];
      const poseProps = {
        x: Number(pose.tx),
        y: Number(pose.ty),
        z: Number(pose.tz),
        roll: Number(pose.rx),
        pitch: Number(pose.ry),
        yaw: Number(pose.rz)
      };

      const transformMatrix = new Pose(poseProps).getTransformationMatrix();

      timeslices[frameIndex].push({
        ...itemProps,
        ...poseProps,
        vertices: bounds.map(p => transformMatrix.transformVector(p))
      });
      frameIndex++;
    });
  });

  return timeslices;
}

function formatToXVIZ(frames) {
  return frames.map(objects => {
    return objects.reduce((resArr, obj) => {
      const polygon2d = {
        ...obj,
        type: 'polygon2d'
      };
      resArr.push(polygon2d);

      return resArr;
    }, []);
  });
}

function generateJsonFiles(getPath, tracklets) {
  tracklets.forEach((pose, i) => {
    const frameDir = getPath(i);
    const poseFilePath = `${frameDir}/tracklets.json`;
    fs.writeFileSync(poseFilePath, JSON.stringify(pose, null, 2), {
      flag: 'w'
    });
  });
}

function parse(originDataPath, getPath) {
  console.log('processing tracklets'); // eslint-disable-line
  const trackletFilePath = path.join(originDataPath, 'tracklet_labels.xml');
  const tracklets = loadTracklets(trackletFilePath);
  const data = formatToXVIZ(tracklets);
  generateJsonFiles(getPath, data);
  console.log('processing tracklets done'); // eslint-disable-line
}

module.exports = parse;
