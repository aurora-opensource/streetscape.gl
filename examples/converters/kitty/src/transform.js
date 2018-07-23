/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const {
  experimental: {Pose}
} = require('math.gl');

const {getTimestamps, createDir} = require('./parsers/common');
const parseGPSData = require('./parsers/parse-gps-data');
const parseLidarPoints = require('./parsers/parse-lidar-points');
const parseTracklets = require('./parsers/parse-tracklets');
const parseArgs = require('./parsers/parse-args');
const generateMetadata = require('./parsers/generate-metadata');
const {
  DEFAULT_INPUT_ROOT,
  DEFAULT_OUTPUT_ROOT,
  DEFAULT_DATE,
  DEFAULT_DRIVE,
  STREAMS,
  STREAMS_METADATA
} = require('./parsers/constants');

const runPath = __dirname;

// extract args from user input
function getArgs() {
  const args = parseArgs();
  const baseInputPath = path.join(runPath, args.root || DEFAULT_INPUT_ROOT, args.date || DEFAULT_DATE);
  const baseOutputPath = path.join(runPath, args.root || DEFAULT_OUTPUT_ROOT, args.date || DEFAULT_DATE);
  console.log(baseInputPath, baseOutputPath);
  const disableStreams = (args.disable_streams || '').split(',').reduce((resMap, name) => {
    resMap[name] = name;
    return resMap;
  }, {});

  return {
    basePath: baseInputPath,
    date: args.date || DEFAULT_DATE,
    drive: args.drive || DEFAULT_DRIVE,
    outdir: args.outdir || baseOutputPath,
    disableStreams
  };
}

function getOriginDataPath({basePath, date, drive}) {
  return path.join(basePath, `${date}_drive_${drive}_sync`);
}

function getGeneratedDataPath({outdir, date, drive}) {
  return path.join(outdir, `${date}_drive_${drive}_sync`);
}

function createGeneratedDirs(getPath, numOfFrames) {
  const dirs = [];
  for (let i = 0; i < numOfFrames; i++) {
    const path = getPath(i);
    createDir(path);
    dirs.push(path);
  }
  return dirs;
}

function getVehiclePose(frameDir) {
  const gpsData = require(`${frameDir}/gps-data.json`);
  return gpsData.pose;
}

function getVelocity(frameDir) {
  const gpsData = require(`${frameDir}/gps-data.json`);
  const velocity = gpsData.velocity;
  return {
    timestamps: [Number(velocity.timestamp)],
    type: 'float',
    values: [Number(velocity['velocity-forward'])]
  };
}

function getAcceleration(frameDir) {
  const gpsData = require(`${frameDir}/gps-data.json`);
  const acceleration = gpsData.velocity;
  return {
    timestamps: [Number(acceleration.timestamp)],
    type: 'float',
    values: [Number(acceleration['acceleration-forward'])]
  };
}

function getLidarPointsPrimitives(frameDir) {
  const lidarPoints = require(`${frameDir}/lidar-points.json`);
  return lidarPoints;
}

function getTrackletsPrimitives(frameDir) {
  const tracklets = require(`${frameDir}/tracklets.json`);
  return tracklets;
}

function getVehiclePoseTrajectory(frameDir) {
  const trajectory = require(`${frameDir}/motion-planning-vehicle.json`);
  return trajectory;
}

function getTrackletsTrajectory(frameDir) {
  const trajectory = require(`${frameDir}/motion-planning-tracklets.json`);
  return trajectory;
}

const MOTION_PLANNING_STEPS = 50;

function generateTrajectory({frameDirs, trajectoryFileName, getMotion, getTrajectory}) {
  const length = frameDirs.length;
  const motions = [];

  // first frame
  for (let i = 0; i < 1 + Math.min(MOTION_PLANNING_STEPS, length); i++) {
    const motion = getMotion(getDestinationPath(i));
    motions.push(motion);
  }
  let frameDir = getDestinationPath(0);
  let trajectory = getTrajectory(motions, 0);
  fs.writeFileSync(path.join(frameDir, trajectoryFileName), JSON.stringify(trajectory), {
    flag: 'w'
  });

  // other frames
  for (let frame = 1; frame < length; frame++) {
    // pop first frame
    motions.shift();
    // push last frame
    const lastMotionStep = frame + MOTION_PLANNING_STEPS;
    if (lastMotionStep < length) {
      const motion = getMotion(getDestinationPath(lastMotionStep));
      motions.push(motion);
    }
    frameDir = getDestinationPath(frame);
    trajectory = getTrajectory(motions, frame);
    fs.writeFileSync(path.join(frameDir, trajectoryFileName), JSON.stringify(trajectory), {
      flag: 'w'
    });
  }
}

function getPoseOffset(p1, p2) {
  const point1 = turf.point([p1.longitude, p1.latitude]);
  const point2 = turf.point([p2.longitude, p2.latitude]);
  const distInMeters = turf.distance(point1, point2, {units: 'meters'});
  const bearing = turf.bearing(point1, point2);
  const radianDiff = ((90 - bearing) * Math.PI) / 180.0 - p1.yaw;
  return [distInMeters * Math.cos(radianDiff), distInMeters * Math.sin(radianDiff)];
}

function generateVehiclePoseTrajectory(originDataPath, getDestinationPath, frameDirs) {
  generateTrajectory({
    frameDirs,
    trajectoryFileName: 'motion-planning-vehicle.json',
    getMotion: getVehiclePose,
    getTrajectory: (motions, frame) => {
      const vertices = motions.map((m, i) => {
        return getPoseOffset(motions[0], m);
      });

      return [
        {
          type: 'line2d',
          vertices,
          poses: motions.map(m => ({
            latitude: m.latitude,
            longitude: m.longitude,
            altitude: m.altitude
          }))
        }
      ];
    }
  });
}

function generateTrackletsTrajectory(originDataPath, getDestinationPath, frameDirs) {
  generateTrajectory({
    frameDirs,
    trajectoryFileName: 'motion-planning-tracklets.json',
    getMotion: getTrackletsPrimitives,
    getTrajectory: (motions, initialFrame) => {
      // motions includes tracklets from initialFrame to initialFrame + MOTION_PLANNING_STEPS
      // each motion element contains all the tracklets in that frame
      const initialFrameDir = getDestinationPath(initialFrame);
      const initialVehiclePose = getVehiclePose(initialFrameDir);

      const trackletsCurrFrame = motions[0];
      const trackletsMap = trackletsCurrFrame.reduce((resMap, t) => {
        const {id, x, y, z} = t;
        resMap[t.id] = {id, x, y, z, motions: []};
        return resMap;
      }, {});

      if (motions && motions.length > 1) {
        for (let i = 0; i < motions.length; i++) {
          const tracklets = motions[i];

          const currFrameDir = getDestinationPath(initialFrame + i);
          const currVehiclePose = getVehiclePose(currFrameDir);

          const [x, y] = getPoseOffset(initialVehiclePose, currVehiclePose);

          const transformMatrix = new Pose(currVehiclePose).getTransformationMatrixFromPose(
            new Pose(initialVehiclePose)
          );

          // filter the tracklets (in frame + i_step_forward) but not in current frame
          tracklets.filter(t => trackletsMap[t.id]).forEach(t => {
            const trackletPath = trackletsMap[t.id];
            // tracklets in curr frame is meters offset based on current vehicle pose
            // need to convert to the coordinate system of the last vehicle pose
            const p = transformMatrix.transformVector([t.x, t.y, t.z]);
            trackletPath.motions.push([p[0] + x, p[1] + y, p[2]]);
          });
        }
      }

      return Object.keys(trackletsMap).map(trackletId => {
        return {
          type: 'line2d',
          vertices: trackletsMap[trackletId].motions
        };
      });
    }
  });
}

function getNumOfFrames(originDataPath) {
  const timestampsFilePath = path.resolve(originDataPath, 'oxts', 'timestamps.txt');
  return getTimestamps(timestampsFilePath).length;
}

const SORTED_STREAMS = [
  [STREAMS.VEHICLE_POSE],
  [STREAMS.ACCELERATION],
  [STREAMS.VELOCITY],
  [STREAMS.LIDAR_POINTS],
  [STREAMS.TRACKLETS],
  [STREAMS.VEHICLE_POSE_TRAJECTORY],
  [STREAMS.TRACKLETS_TRAJECTORY]
];

const STREAMS_MAP = {
  [STREAMS.VEHICLE_POSE]: {
    name: STREAMS.VEHICLE_POSE,
    type: 'vehicle-pose',
    set: parseGPSData,
    get: getVehiclePose
  },
  [STREAMS.ACCELERATION]: {
    name: STREAMS.ACCELERATION,
    type: 'variable',
    get: getAcceleration
  },
  [STREAMS.VELOCITY]: {
    name: STREAMS.VELOCITY,
    type: 'variable',
    get: getVelocity
  },
  [STREAMS.LIDAR_POINTS]: {
    name: STREAMS.LIDAR_POINTS,
    type: 'primitive',
    set: parseLidarPoints,
    get: getLidarPointsPrimitives
  },
  [STREAMS.TRACKLETS]: {
    name: STREAMS.TRACKLETS,
    type: 'primitive',
    set: parseTracklets,
    get: getTrackletsPrimitives
  },
  [STREAMS.VEHICLE_POSE_TRAJECTORY]: {
    name: STREAMS.VEHICLE_POSE_TRAJECTORY,
    type: 'primitive',
    set: generateVehiclePoseTrajectory,
    get: getVehiclePoseTrajectory
  },
  [STREAMS.TRACKLETS_TRAJECTORY]: {
    name: STREAMS.TRACKLETS_TRAJECTORY,
    type: 'primitive',
    set: generateTrackletsTrajectory,
    get: getTrackletsTrajectory
  }
};

function assembleFrame(frameDirs, disableStreams) {
  let start = Date.now();

  frameDirs.forEach((frameDir, i) => {
    const frameFilePath = `${frameDir}-frame.json`;

    const frameMap = {
      vehicle_pose: null,
      state_updates: [
        {
          timestamps: null,
          variables: {},
          primitives: {}
        }
      ]
    };

    SORTED_STREAMS.forEach(stream => {
      const {name, type} = STREAMS_MAP[stream];
      if (!disableStreams[stream]) {
        const value = STREAMS_MAP[stream].get(frameDir);

        switch (type) {
          case 'vehicle-pose':
            frameMap['vehicle_pose'] = value;
            frameMap['state_updates'][0].timestamps = Number(value.time);
            break;
          case 'variable':
            frameMap['state_updates'][0].variables[name] = value;
            break;
          case 'primitive':
            frameMap['state_updates'][0].primitives[name] = value;
            break;
          default:
        }
      }
    });

    fs.writeFileSync(frameFilePath, JSON.stringify(frameMap, null, 2), {
      flag: 'w'
    });
    const end = Date.now();
    console.log(`generate ${path.basename(frameFilePath)} (total 154) in ${end - start}s`);
    start = end;
  });
}

const args = getArgs();
const disableStreams = args.disableStreams || [];
const originDataPath = getOriginDataPath(args);
const generatedDataPath = getGeneratedDataPath(args);
const getDestinationPath = frame => path.resolve(generatedDataPath, `${frame + 2}`);

const numOfFrames = getNumOfFrames(originDataPath);
const frameDirs = createGeneratedDirs(getDestinationPath, numOfFrames);

// generate streams
SORTED_STREAMS.forEach(stream => {
  if (!disableStreams[stream] && typeof STREAMS_MAP[stream].set === 'function') {
    STREAMS_MAP[stream].set(originDataPath, getDestinationPath, frameDirs);
  }
});

// generate metadata file
const timeFilePath = path.join(originDataPath, 'oxts', 'timestamps.txt');
const metaDataFilePath = path.join(generatedDataPath, '1-frame.json');
const streams = Object.values(STREAMS).map(streamName => STREAMS_METADATA[streamName]);
generateMetadata(timeFilePath, metaDataFilePath, streams);

// assemble data by frame
assembleFrame(frameDirs, disableStreams);
