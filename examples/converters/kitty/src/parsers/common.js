const fs = require('fs');
const path = require('path');

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

function getTimeRange(timestampsFilePath) {
  const timestamps = getTimestamps(timestampsFilePath);
  timestamps.sort();
  return {
    startTime: timestamps[0],
    endTime: timestamps[timestamps.length - 1]
  };
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    // make sure parent exists
    const parent = path.dirname(dirPath);
    createDir(parent);

    fs.mkdirSync(dirPath);
  }
}

module.exports = {
  createDir,
  getTimestamps,
  getTimeRange
};
