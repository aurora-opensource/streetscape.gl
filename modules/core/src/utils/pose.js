import {_Pose as Pose} from 'math.gl';

export function getPoseFromJson(obj) {
  if (!obj) {
    return null;
  }
  if (obj instanceof Pose) {
    return obj;
  }
  if (obj.position && obj.orientation) {
    return new Pose({
      x: obj.position[0],
      y: obj.position[1],
      z: obj.position[2],
      roll: obj.orientation[0],
      pitch: obj.orientation[1],
      yaw: obj.orientation[2]
    });
  }
  return new Pose(obj);
}
