/**
 * Parse GPS/IMU data (stored in oxts dir),
 * extract vehicle pose, velocity and acceleration information
 */

const fs = require('fs');
const path = require('path');

const {getTimestamps} = require('./common');

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

function loadOxtsPackets(filePath) {
  // Generator to read OXTS ground truth data.
  // Poses are given in an East-North-Up coordinate system
  // whose origin is the first GPS position.
  const content = fs.readFileSync(filePath, 'utf8').split('\n')[0];
  const values = content.split(' ').filter(Boolean);
  const packet = getOxtsPacket(values);
  return packet;
}

function loadTimestamps(timestampsFile) {
  return getTimestamps(timestampsFile);
}

function formatToXVIZ(timestamp, oxts) {
  const {
    lat,
    lon,
    alt,
    roll,
    pitch,
    yaw,
    vn,
    ve,
    vf,
    vl,
    vu,
    ax,
    ay,
    az,
    af,
    al,
    au,
    wx,
    wy,
    wz,
    wf,
    wl,
    wu
  } = oxts;
  const resMap = {};

  resMap.pose = {
    time: timestamp,
    latitude: Number(lat),
    longitude: Number(lon),
    altitude: Number(alt),
    roll: Number(roll),
    pitch: Number(pitch),
    yaw: Number(yaw)
  };

  resMap.velocity = {
    timestamp,
    'velocity-north': Number(vn),
    'velocity-east': Number(ve),
    'velocity-forward': Number(vf),
    'velocity-left': Number(vl),
    'velocity-upward': Number(vu),
    'angular-rate-x': Number(wx),
    'angular-rate-y': Number(wy),
    'angular-rate-z': Number(wz),
    'angular-rate-forward': Number(wf),
    'angular-rate-left': Number(wl),
    'angular-rate-upward': Number(wu)
  };

  resMap.acceleration = {
    timestamp,
    'acceleration-x': Number(ax),
    'acceleration-y': Number(ay),
    'acceleration-z': Number(az),
    'acceleration-forward': Number(af),
    'acceleration-left': Number(al),
    'acceleration-upward': Number(au)
  };

  return resMap;
}

function generateJsonFiles(filePath, {pose, velocity, acceleration}) {
  const data = {
    pose,
    velocity,
    acceleration
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {flag: 'w'});
}

function processSingleFrame(srcFiePath, dstFilePath, timestamp) {
  const gpsData = loadOxtsPackets(srcFiePath);
  const formatted = formatToXVIZ(timestamp, gpsData);
  generateJsonFiles(dstFilePath, formatted);
}

function parse(originDataPath, getPath) {
  const gpsDataDirPath = path.join(originDataPath, 'oxts', 'data');
  const timeFilePath = path.join(originDataPath, 'oxts', 'timestamps.txt');
  const timestamps = loadTimestamps(timeFilePath);

  const gpsDataFiles = fs.readdirSync(gpsDataDirPath).sort();
  gpsDataFiles.forEach((fileName, i) => {
    console.log(`processing gps data frame ${i}/${timestamps.length}`); // eslint-disable-line
    const srcFilePath = `${gpsDataDirPath}/${fileName}`;
    const dstFilePath = path.join(getPath(i), 'gps-data.json');
    processSingleFrame(srcFilePath, dstFilePath, timestamps[i]);
  });
}

module.exports = parse;
