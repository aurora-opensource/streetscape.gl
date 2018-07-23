/**
 * Parse LiDar data (stored in velodyne_points dir),
 */

const BinaryParser = require('binary-parser').Parser;
const fs = require('fs');
const uuid = require('uuid').v4;
const parser = new BinaryParser().floatle();
const path = require('path');
const {GLBContainer, GLBBufferPacker, packJsonArrays, addglTFBufferDescriptors} = require('@uber/xviz');

const {getTimestamps} = require('./common');

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
    positions[i * 3 + 2] = float[i * 4 + 2];
    reflectance[i] = float[i * 4 + 3];
  }
  return {positions, reflectance};
}

function toBuffer(ab) {
  const buf = new Buffer(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

function generateFile(filePath, inputJson, format = 'glb') {
  switch (format) {
  case 'glb':
    const bufferPacker = new GLBBufferPacker();
    const xvizJson = packJsonArrays(inputJson, bufferPacker);
    const {json, arrayBuffer} = bufferPacker.packBuffers(bufferPacker.buffers, addglTFBufferDescriptors);
    json.xviz = xvizJson;
    const glbFileBuffer = GLBContainer.createGlbBuffer(son, arrayBuffer);
    fs.writeFileSync(`${filePath}.glb`, toBuffer(glbFileBuffer), {flag: 'w'});
    console.log(`Wrote ${filePath}.glb`);
    break;
  default:
    fs.writeFileSync(`${filePath}.json`, JSON.stringify(inputJson), {flag: 'w'});
  }
}

function processSingleFrame(srcFilePath, dstFilePath, timestamp) {
  const {positions, reflectance} = loadLidarData(srcFilePath);
  const formattedData = [
    {
      timestamp,
      id: uuid(),
      type: 'points3d',
      vertices: positions,
      reflectance
    }
  ];
  // generateJsonFile(dstFilePath, formattedData);
  generateFile(dstFilePath, formattedData, 'glb');
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
    const dstFilePath = path.join(getPath(i), 'lidar-points');
    processSingleFrame(srcFilePath, dstFilePath, timestamps[i]);
  });
}

module.exports = parse;
