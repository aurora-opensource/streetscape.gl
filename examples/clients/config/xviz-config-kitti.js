import {setXvizSettings, setXvizConfig} from '@xviz/parser';

export const XVIZ_SETTINGS = {
  TIME_WINDOW: 400
};

setXvizSettings(XVIZ_SETTINGS);

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: 'vehicle-pose',
  OBJECT_STREAM: '/tracklets/objects'
};

setXvizConfig(XVIZ_CONFIG);
