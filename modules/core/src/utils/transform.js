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
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {_Pose as Pose, Matrix4} from 'math.gl';
import {addMetersToLngLat} from 'viewport-mercator-project';

import {COORDINATE} from '../constants';

// keep in sync with core-3d-viewer.js
const DEFAULT_ORIGIN = [0, 0, 0];

// CamelCase issue
function getTargetPose(obj) {
  return obj.target_pose || obj.targetPose;
}

// Export only for testing
export function resolveLinksTransform(links, poses, streamName) {
  const transforms = [];

  if (poses[streamName]) {
    transforms.push(poses[streamName]);
  }

  let parentPose = links[streamName] && getTargetPose(links[streamName]);

  // TODO(twojtasz): we could cache the resulting transform based on the entry
  // into the link structure.

  const seen = new Set();
  // Collect all poses from child to root
  while (parentPose && !seen.has(parentPose)) {
    seen.add(parentPose);
    if (poses[parentPose]) {
      transforms.push(poses[parentPose]);
    }
    parentPose = links[parentPose] && getTargetPose(links[parentPose]);
  }

  // TODO(twojtasz): if parentPose !== undefined, then we hit a cycle
  // we should not have. Need way to communicate this error.

  if (transforms.length) {
    // process from root to child
    return transforms.reduceRight((acc, val) => {
      return acc.multiplyRight(new Pose(val).getTransformationMatrix());
    }, new Matrix4());
  }

  return null;
}

/* Return the modelMatrix used for rendering a stream.
 *
 * frame - constains all the XVIZ state
 * streamName - The name of the stream we are rendering
 * streamMetadata - Anym metadata associated with the stream
 * getTransformMatrix - A callback function for when stream metadata specifieds a DYNAMIC coordinate system
 */
export function resolveCoordinateTransform(
  frame,
  streamName,
  streamMetadata = {},
  getTransformMatrix
) {
  const {origin, links = {}, poses, transforms = {}, vehicleRelativeTransform} = frame;
  const {coordinate, transform, pose} = streamMetadata;

  let coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS;
  let modelMatrix = null;
  let streamTransform = transform;

  switch (coordinate) {
    case COORDINATE.GEOGRAPHIC:
      coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
      break;

    case COORDINATE.DYNAMIC:
      // TODO(twojtasz): this should work with links and needs streamName passed
      // cache calculated transform matrix for each frame
      transforms[transform] = transforms[transform] || getTransformMatrix(transform, frame);
      modelMatrix = transforms[transform];
      frame.transforms = transforms;
      streamTransform = null;
      break;

    case COORDINATE.VEHICLE_RELATIVE:
      // NOTE: In XVIZ this setting means a relationship to `/vehicle_pose` stream.
      // However, with the addition of *links* this really becomes only a convenience
      // as you could choose arbitrary poses.
      // TODO: this should work with links
      modelMatrix = vehicleRelativeTransform;
      break;

    default:
    case COORDINATE.IDENTITY:
      modelMatrix = resolveLinksTransform(links, poses, streamName);
      break;
  }

  if (pose) {
    // TODO(twojtasz): remove when builder updates
    streamTransform = new Pose(pose).getTransformationMatrix();
  }
  if (streamTransform && streamTransform.length > 0) {
    // TODO(twojtasz): this needs tested with links
    modelMatrix = modelMatrix
      ? new Matrix4(modelMatrix).multiplyRight(streamTransform)
      : streamTransform;
  }

  return {
    coordinateSystem,
    coordinateOrigin: origin || DEFAULT_ORIGIN,
    modelMatrix
  };
}

export function positionToLngLat([x, y, z], {coordinateSystem, coordinateOrigin, modelMatrix}) {
  if (modelMatrix) {
    [x, y, z] = new Matrix4(modelMatrix).transformAsPoint([x, y, z]);
  }

  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.METER_OFFSETS:
      return addMetersToLngLat(coordinateOrigin, [x, y, z]);

    case COORDINATE_SYSTEM.LNGLAT:
    default:
      return [x, y, z];
  }
}
