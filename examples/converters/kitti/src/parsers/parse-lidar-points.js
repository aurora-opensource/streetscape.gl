/**
 * Parse LiDar data (stored in velodyne_points dir),
 */

import {Parser as BinaryParser} from 'binary-parser';
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

export function loadLidarData(contents) {
  const binary = readBinaryFile(contents);
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
