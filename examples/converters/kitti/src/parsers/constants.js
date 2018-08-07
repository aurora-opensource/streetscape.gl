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
