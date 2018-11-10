import {setXVIZConfig} from '@xviz/parser';

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: '/vehicle_pose',
  OBJECT_STREAM: '/tracklets/objects'
};

setXVIZConfig(XVIZ_CONFIG);
