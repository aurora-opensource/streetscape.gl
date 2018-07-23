export const MAP_STYLE = 'https://d3dt5tsgfu6lcf.cloudfront.net/style/tools/web?mode=light';

export const DATA_TYPE = {
  VEHICLE_POSE: 0,
  IMAGE: 1,
  POINT_CLOUD: 2,
  TRACKING: 3
};

export const DATA_CONFIG = {
  baseUrl: './data/2011_09_26/2011_09_26_drive_0005_sync',
  datasets: {
    oxts: DATA_TYPE.VEHICLE_POSE,
    velodyne_points: DATA_TYPE.POINT_CLOUD,
    image_00: DATA_TYPE.IMAGE,
    image_01: DATA_TYPE.IMAGE,
    image_02: DATA_TYPE.IMAGE,
    image_03: DATA_TYPE.IMAGE,
    tracklet_labels: DATA_TYPE.TRACKING
  }
};

export const OBJECT_COLORS = {
  Van: [38, 126, 99],
  Cyclist: [218, 112, 191],
  Pedestrian: [254, 197, 100],
  Car: [125, 221, 215],
  Unknown: [166, 165, 165]
};
