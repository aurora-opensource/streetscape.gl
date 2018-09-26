import {setXvizSettings, setXvizConfig, XvizObject, XvizObjectCollection} from '@xviz/parser';

XvizObject.setDefaultCollection(new XvizObjectCollection({ObjectType: XvizObject}));

export const XVIZ_SETTINGS = {
  TIME_WINDOW: 1200
};

setXvizSettings(XVIZ_SETTINGS);

export const XVIZ_CONFIG = {
  PRIMARY_POSE_STREAM: 'vehicle-pose',

  observeObject: XvizObject.observe
};

setXvizConfig(XVIZ_CONFIG);
