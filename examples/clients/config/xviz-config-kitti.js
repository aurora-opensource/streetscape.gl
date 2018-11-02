import {setXvizSettings, setXvizConfig} from '@xviz/parser';

export const XVIZ_SETTINGS = {
  currentMajorVersion: 2,
  TIME_WINDOW: 400
};

setXvizSettings(XVIZ_SETTINGS);

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: '/vehicle_pose',
  OBJECT_STREAM: '/tracklets/objects'
};

setXvizConfig(XVIZ_CONFIG);
