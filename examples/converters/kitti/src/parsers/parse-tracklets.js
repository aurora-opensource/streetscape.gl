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
