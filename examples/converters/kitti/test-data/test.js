const {unpackGLB, packGLB} = require('../src/parsers/common');

const frameData = require('./3-frame');

const lidarFilePath = './lidar-points';

function main() {
  const lidarPoints = unpackGLB(lidarFilePath);
  frameData.state_updates[0].primitives.lidarPoints = lidarPoints;
  packGLB('./3-frame.glb', frameData);
}

main();
