import {XVIZFileLoader} from 'streetscape.gl';
import {XVIZ_CONFIG_KITTI, XVIZ_CONFIG_NUTONOMY, XVIZ_SETTINGS_NUTONOMY} from 'xviz-config';
import {setXVIZConfig, setXVIZSettings} from '@xviz/parser';

import BuildingLayer from './layers/building-layer/building-layer';

function getLogPath(namespace, logName) {
  switch (namespace) {
    case 'kitti':
      return `kitti/2011_09_26/2011_09_26_drive_${logName}_sync`;
    case 'nutonomy':
      return `nutonomy/nuscenes_teaser_meta_v1/v0.1/scene-${logName}`;
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

export function getLogConfig(namespace) {
  switch (namespace) {
    case 'kitti':
      return {
        xvizConfig: XVIZ_CONFIG_KITTI
      };
    case 'nutonomy':
      return {
        xvizConfig: XVIZ_CONFIG_NUTONOMY,
        xvizSettings: XVIZ_SETTINGS_NUTONOMY
      };
    default:
      return null;
  }
}

export function getCustomLayers(namespace) {
  switch (namespace) {
    case 'kitti':
      return [new BuildingLayer()];
    case 'nutonomy':
    default:
      return null;
  }
}

export function setLogConfig(namespace) {
  const {xvizConfig, xvizSettings} = getLogConfig(namespace);
  if (xvizConfig) {
    setXVIZConfig(xvizConfig);
  }
  if (xvizSettings) {
    setXVIZSettings(xvizSettings);
  }
}
