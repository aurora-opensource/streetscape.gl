/**
 * Parse LiDar data (stored in velodyne_points dir),
 */

const BinaryParser = require('binary-parser').Parser;
const parser = new BinaryParser().floatle();

function readBinaryFile(binary) {
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

function loadLidarData(contents) {
  const binary = readBinaryFile(contents);
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

module.exports = {
  loadLidarData
};
