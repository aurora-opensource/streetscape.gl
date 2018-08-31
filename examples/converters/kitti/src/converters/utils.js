import * as turf from '@turf/turf';

const MOTION_PLANNING_STEPS = 50;

export function generateTrajectoryFrame(start, limit, getMotion, getTrajectory) {
  const motions = [];

  const iterLimit = Math.min(start + MOTION_PLANNING_STEPS, limit);
  for (let i = start; i < iterLimit; i++) {
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
