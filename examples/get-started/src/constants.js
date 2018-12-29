/* eslint-disable camelcase */
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v9';

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: '/vehicle_pose',
  OBJECT_STREAM: '/tracklets/objects'
};

export const XVIZ_SETTINGS = {
  PLAYBACK_FRAME_RATE: 10
};

export const CAR = {
  origin: [1.08, -0.32, 0],
  scale: [4.3, 1.8, 1.5]
};

export const APP_SETTINGS = {
  viewMode: {
    type: 'select',
    title: 'View Mode',
    data: {TOP_DOWN: 'Top Down', PERSPECTIVE: 'Perspective', DRIVER: 'Driver'}
  }
};

export const XVIZ_STYLE = {
  '/tracklets/objects': [{name: 'selected', style: {fill_color: '#ff8000aa'}}]
};
