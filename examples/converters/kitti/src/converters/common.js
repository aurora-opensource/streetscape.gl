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

const turf = require('@turf/turf');

const MOTION_PLANNING_STEPS = 50;

export function generateTrajectoryFrame(start, limit, getMotion, getTrajectory) {
  const motions = [];

  const iterationLimit = Math.min(start + MOTION_PLANNING_STEPS, limit);
  for (let i = start; i < iterationLimit; i++) {
    motions.push(getMotion(i));
  }

  return getTrajectory(motions);
}

export function getPoseOffset(p1, p2) {
  const point1 = turf.point([p1.longitude, p1.latitude]);
  const point2 = turf.point([p2.longitude, p2.latitude]);
  const distInMeters = turf.distance(point1, point2, {units: 'meters'});
  const bearing = turf.bearing(point1, point2);
  const radianDiff = ((90 - bearing) * Math.PI) / 180.0 - p1.yaw;
  return [distInMeters * Math.cos(radianDiff), distInMeters * Math.sin(radianDiff)];
}
