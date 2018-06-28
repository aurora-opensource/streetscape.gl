/**
 * Parse LiDar data (stored in velodyne_points dir),
 */

const BinaryParser = require('binary-parser').Parser;
const fs = require('fs');
const uuid = require('uuid').v4;
const parser = new BinaryParser().floatle();
const path = require('path');

const {getTimestamps} = require('./common');

function loadTimestamps(timestampsFile) {
  return getTimestamps(timestampsFile)
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
  const size = float.length / 4;
  const positions = [];
  for (let i = 0; i < size; i++) {
    const x = float[i * 4];
    const y = float[i * 4 + 1];
    const z = float[i * 4 + 2];
    const reflectance = float[i * 4 + 3];
    positions[i] = [x, y, z, reflectance];
  }
  return positions;
}

function generateJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data), {flag: 'w'});
}

function processSingleFrame(srcFilePath, dstFilePath, timestamp) {
  const lidarData = loadLidarData(srcFilePath);
  const formattedData = [{
    timestamp,
    id: uuid(),
    type: 'points3d',
    vertices: lidarData,
  }];
  generateJsonFile(dstFilePath, formattedData);
}

function parse(originDataPath, getPath) {
  const timeFilePath = path.join(originDataPath, 'velodyne_points', 'timestamps.txt');
  // TODO load start and end timestamps if necessary
  const timestamps = loadTimestamps(timeFilePath);
  const lidarDirPath = path.join(originDataPath, 'velodyne_points', 'data');
  const lidarDataFiles = fs.readdirSync(lidarDirPath).sort();
  lidarDataFiles.forEach((fileName, i) => {
    console.log(`processing lidar data frame ${i}/${timestamps.length}`);
    const srcFilePath = `${lidarDirPath}/${fileName}`;
    const dstFilePath = path.join(getPath(i), 'lidar-points.json');
    processSingleFrame(srcFilePath, dstFilePath, timestamps[i])
  });
}

module.exports = parse;
