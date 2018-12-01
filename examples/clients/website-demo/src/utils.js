import {XVIZFileLoader} from 'streetscape.gl';

function getLogPath(namespace, logName) {
  switch (namespace) {
    case 'kitti':
      return `kitti/2011_09_26/2011_09_26_drive_${logName}_sync`;
    default:
      return null;
  }
}

function getLogFilePath(namespace, logName, index) {
  const logPath = getLogPath(namespace, logName);
  return `${logPath}/${index + 1}-frame.glb`;
}

function getTimingFilePath(namespace, logName) {
  const logPath = getLogPath(namespace, logName);
  return `${logPath}/0-frame.json`;
}

/* eslint-disable no-console, no-undef */
export function getLogLoader(namespace, logName) {
  return new XVIZFileLoader({
    timingsFilePath: getTimingFilePath(namespace, logName),
    getFilePath: index => getLogFilePath(namespace, logName, index),
    worker: true,
    maxConcurrency: 4
  }).on('error', console.error);
}
/* eslint-enable no-console */
