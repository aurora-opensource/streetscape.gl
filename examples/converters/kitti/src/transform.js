// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');
const {_Pose: Pose} = require('math.gl');

const {
  getTimestamps,
  createDir,
  deleteDirRecursive,
  packGLB,
  unpackGLB
} = require('./parsers/common');
const parseGPSData = require('./parsers/parse-gps-data');
const parseLidarPoints = require('./parsers/parse-lidar-points');
const parseTracklets = require('./parsers/parse-tracklets');
const generateMetadata = require('./parsers/generate-metadata');
const {STREAMS, STREAMS_METADATA} = require('./parsers/constants');

// const DEFAULT_UNTOKENIZER = value => {
//   if (typeof value === 'string') {
//     const matches = value.match(/\$\$\$([0-9]+)/);
//     return matches ? parseInt(matches[1], 10) : -1;
//   }
//   return -1;
// };

// function unpackJsonArrays(json, buffers, untokenize = DEFAULT_UNTOKENIZER) {
//   const object = json;

//   // Check if a buffer token in that case replace with buffer
//   const bufferIndex = untokenize(object);
//   if (bufferIndex >= 0) {
//     return buffers[bufferIndex];
//   }

//   // Copy array
//   if (Array.isArray(object)) {
//     return object.map(element => unpackJsonArrays(element, buffers, untokenize));
//   }

//   // Copy object
//   if (object !== null && typeof object === 'object') {
//     const newObject = {};
//     for (const key in object) {
//       newObject[key] = unpackJsonArrays(object[key], buffers, untokenize);
//     }
//     return newObject;
//   }

//   return object;
// }

function createGeneratedDirs(getPath, numOfFrames) {
  const dirs = [];
  for (let i = 0; i < numOfFrames; i++) {
    const dir = getPath(i);
    createDir(dir);
    dirs.push(dir);
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
  const acceleration = gpsData.acceleration;
  return {
    timestamps: [Number(acceleration.timestamp)],
    type: 'float',
    values: [Number(acceleration['acceleration-forward'])]
  };
}

function getLidarPointsPrimitives(frameDir) {
  const lidarPoints = unpackGLB(`${frameDir}/lidar-points`);
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

function generateTrajectory({
  frameDirs,
  trajectoryFileName,
  getDestinationPath,
  getMotion,
  getTrajectory
}) {
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
    getDestinationPath,
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
    getDestinationPath,
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
    const frameFilePath = `${frameDir}-frame`;

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
      if (!disableStreams[stream] && typeof STREAMS_MAP[stream].get === 'function') {
        const value = STREAMS_MAP[stream].get(frameDir);

        switch (type) {
          case 'vehicle-pose':
            frameMap.vehicle_pose = value;
            frameMap.state_updates[0].timestamps = Number(value.time);
            break;
          case 'variable':
            frameMap.state_updates[0].variables[name] = value;
            break;
          case 'primitive':
            frameMap.state_updates[0].primitives[name] = value;
            break;
          default:
        }
      }
    });

    packGLB(frameFilePath, frameMap);
    const end = Date.now();
    console.log(`generate ${path.basename(frameFilePath)} (total 154) in ${end - start}s`); // eslint-disable-line
    start = end;
  });
}

function cleanup(frameDirs) {
  frameDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      deleteDirRecursive(dir);
    }
  });
}

module.exports = function main(args) {
  const {inputDir, outputDir, disableStreams} = args;

  const getDestinationPath = frame => path.resolve(outputDir, `${frame + 2}`);

  const numOfFrames = getNumOfFrames(inputDir);
  const frameDirs = createGeneratedDirs(getDestinationPath, numOfFrames);

  // generate streams
  SORTED_STREAMS.forEach(stream => {
    if (!disableStreams[stream] && typeof STREAMS_MAP[stream].set === 'function') {
      STREAMS_MAP[stream].set(inputDir, getDestinationPath, frameDirs);
    }
  });

  // generate metadata file
  const timeFilePath = path.join(inputDir, 'oxts', 'timestamps.txt');
  const metaDataFilePath = path.join(outputDir, '1-frame');
  const streams = Object.values(STREAMS).map(streamName => STREAMS_METADATA[streamName]);
  generateMetadata(timeFilePath, metaDataFilePath, streams);

  // assemble data by frame
  assembleFrame(frameDirs, disableStreams);

  // remove intermediate files
  cleanup(frameDirs);
};
