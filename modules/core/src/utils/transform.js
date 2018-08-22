import {COORDINATE_SYSTEM} from 'deck.gl';
import {_Pose as Pose, Matrix4} from 'math.gl';

import {COORDINATES} from '../constants';

export function resolveCoordinateTransform(vehiclePose, streamMetadata = {}) {
  const {origin, transforms = {}, vehicleRelativeTransform} = vehiclePose;
  const {coordinate, pose} = streamMetadata;

  let coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS;
  let modelMatrix = vehicleRelativeTransform;

  switch (coordinate) {
    case COORDINATES.GEOGRAPHIC:
      coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
      break;

    case COORDINATES.VEHICLE_RELATIVE:
      modelMatrix = vehicleRelativeTransform;
      break;

    default:
      if (coordinate) {
        modelMatrix = transforms[coordinate];
      }
  }

  if (pose) {
    modelMatrix = new Matrix4(modelMatrix).multiplyRight(new Pose(pose).getTransformationMatrix());
  }

  return {
    coordinateSystem,
    coordinateOrigin: origin,
    modelMatrix
  };
}
