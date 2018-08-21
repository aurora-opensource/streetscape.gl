import {setXvizSettings, setXvizConfig, XvizObject, XvizObjectCollection} from '@xviz/parser';

XvizObject.setDefaultCollection(new XvizObjectCollection({ObjectType: XvizObject}));

export const XVIZ_SETTINGS = {
  TIME_WINDOW: 400
};

setXvizSettings(XVIZ_SETTINGS);

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: 'vehicle-pose',
  OBJECT_STREAM: 'tracklets',

  VARIABLE_METADATA: {
    '/vehicle/velocity': {
      id: '/vehicle/velocity',
      title: 'Velocity',
      description: 'forward velocity, i.e. parallel to earth-surface (m/s)',
      unit: 'm/s'
    },
    '/vehicle/acceleration': {
      id: '/vehicle/acceleration',
      title: 'Acceleration',
      description: 'forward acceleration (m/s^2)',
      unit: 'm/s^2'
    }
  },

  observeObject: XvizObject.observe
};

setXvizConfig(XVIZ_CONFIG);
