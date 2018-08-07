const STREAMS = {
  VEHICLE_POSE: 'vehicle-pose',
  VELOCITY: 'velocity',
  ACCELERATION: 'acceleration',
  LIDAR_POINTS: 'lidar-points',
  TRACKLETS: 'tracklets',
  VEHICLE_POSE_TRAJECTORY: 'vehicle-pose-trajectory',
  TRACKLETS_TRAJECTORY: 'tracklets-trajectory'
};

const STREAMS_METADATA = {
  [STREAMS.VEHICLE_POSE]: {
    name: STREAMS.VEHICLE_POSE,
    category: 'vehicle-pose'
  },
  [STREAMS.VELOCITY]: {
    name: STREAMS.VELOCITY,
    category: 'time_series',
    type: 'float',
    unit: 'm/s'
  },
  [STREAMS.ACCELERATION]: {
    name: STREAMS.ACCELERATION,
    category: 'time_series',
    type: 'float',
    unit: 'm/s^2'
  },
  [STREAMS.LIDAR_POINTS]: {
    name: STREAMS.LIDAR_POINTS,
    category: 'primitive',
    type: 'point'
  },
  [STREAMS.TRACKLETS]: {
    name: STREAMS.TRACKLETS,
    category: 'primitive',
    type: 'polygon'
  },
  [STREAMS.VEHICLE_POSE_TRAJECTORY]: {
    name: STREAMS.VEHICLE_POSE_TRAJECTORY,
    category: 'primitive',
    type: 'polyline'
  },
  [STREAMS.TRACKLETS_TRAJECTORY]: {
    name: STREAMS.TRACKLETS_TRAJECTORY,
    category: 'primitive',
    type: 'polyline'
  }
};

module.exports = {
  STREAMS,
  STREAMS_METADATA
};
