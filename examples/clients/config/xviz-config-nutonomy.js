import {setXVIZSettings, setXVIZConfig} from '@xviz/parser';

export const XVIZ_SETTINGS = {
  currentMajorVersion: 2,
  TIME_WINDOW: 600
};

setXVIZSettings(XVIZ_SETTINGS);

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: '/vehicle_pose',
  OBJECT_STREAM: '/objects'
};

setXVIZConfig(XVIZ_CONFIG);
