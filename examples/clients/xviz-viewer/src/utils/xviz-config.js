import {setXvizConfig, XvizObject, XvizObjectCollection} from '@uber/xviz';
import {experimental} from 'math.gl';
const {Pose} = experimental;

XvizObject.setDefaultCollection(new XvizObjectCollection({ObjectType: XvizObject}));

const TRACKLET_TYPE = {
  VEHICLE: 'Car',
  BICYCLE: 'Cyclist',
  PEDESTRIAN: 'Pedestrian',
  LARGE_VEHICLE: 'Van',
  UNRECOGNIZED: 'Unknown'
};

// ocs-lite implementation specific
// refactor to stylesheet?
const TRACKLET_COLOR_PALETTE = {
  [TRACKLET_TYPE.LARGE_VEHICLE]: [[38, 126, 99]],
  [TRACKLET_TYPE.BICYCLE]: [[218, 112, 191]],
  [TRACKLET_TYPE.PEDESTRIAN]: [[254, 197, 100]],
  [TRACKLET_TYPE.VEHICLE]: [[125, 221, 215]],
  [TRACKLET_TYPE.UNRECOGNIZED]: [[166, 165, 165]]
};

setXvizConfig({
  // Config
  DEFAULT_METADATA: {},

  // TODO need consolidate with `getVehiclePose` plugin
  PRIMARY_POSE_STREAM: 'vehicle-pose',
  SECONDARY_POSE_STREAM: null,
  OBJECT_STREAM: 'tracklets',
  STREAM_BLACKLIST: [],
  NON_RENDERING_STREAMS: [],
  // ocs-lite implementation specific
  VIDEO_STREAM_PATTERNS: {IMAGE: /^$/, VIDEO: /^$/},

  OBJECT_LABEL: TRACKLET_TYPE,
  OBJECT_LABEL_COLOR_PALETTE: TRACKLET_COLOR_PALETTE,

  // PLUGIN METHODS
  getVehiclePose: logSlice => {
    return logSlice.getStream('vehicle-pose', null);
  },
  // secondary vehicle pose? or remove it?
  // could be another channel
  getGhostVehiclePose: logSlice => {
    return null;
  },
  getTrackedObjectPosition: (logSlice, trackedObjectId) => {
    return null;
  },
  processVehiclePose: datum => {
    return {
      carPosition: datum,
      heading: (datum.yaw / Math.PI) * 180,
      vehiclePose: new Pose(datum)
    };
  },
  getTransformsFromPose: vehiclePose => {
    return {
      transformMatrix: vehiclePose.vehiclePose.getTransformationMatrix()
    };
  },
  postProcessPrimitive: p => p,
  getObjectFeatures: logData => {
    // Find XVIZ object polygon features
    return logData.features.tracklets || [];
  },

  // atg specific
  // could be moved to `postProcessPose`
  annotateObjectFeatures: () => {},
  getLabelNameFromStream: stream => stream,
  getPrimitiveAnnotations: () => {},
  // isPointCloud,
  // filterPrimitive,
  observeObjects: () => {}

  // // TODO/OSS - should be removed
  // isSemanticColorStream,
});
