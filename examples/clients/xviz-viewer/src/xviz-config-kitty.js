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

import {setXvizSettings, setXvizConfig, XvizObject, XvizObjectCollection} from '@xviz/client';
import {_Pose as Pose} from 'math.gl';

XvizObject.setDefaultCollection(new XvizObjectCollection({ObjectType: XvizObject}));

const TRACKLET_TYPE = {
  VEHICLE: 'Car',
  BICYCLE: 'Cyclist',
  PEDESTRIAN: 'Pedestrian',
  LARGE_VEHICLE: 'Van',
  UNRECOGNIZED: 'Unknown'
};

// ocs-lite implementation specific
// refactor to stylesheet?
const TRACKLET_COLOR_PALETTE = {
  [TRACKLET_TYPE.LARGE_VEHICLE]: [[38, 126, 99]],
  [TRACKLET_TYPE.BICYCLE]: [[218, 112, 191]],
  [TRACKLET_TYPE.PEDESTRIAN]: [[254, 197, 100]],
  [TRACKLET_TYPE.VEHICLE]: [[125, 221, 215]],
  [TRACKLET_TYPE.UNRECOGNIZED]: [[166, 165, 165]]
};

export const XVIZ_SETTINGS = {
  TIME_WINDOW: 400
};

setXvizSettings(XVIZ_SETTINGS);

export const XVIZ_CONFIG = {
  // Config
  DEFAULT_METADATA: {},

  // TODO need consolidate with `getVehiclePose` plugin
  PRIMARY_POSE_STREAM: 'vehicle-pose',
  SECONDARY_POSE_STREAM: null,
  OBJECT_STREAM: 'tracklets',
  STREAM_BLACKLIST: [],
  NON_RENDERING_STREAMS: [],
  // ocs-lite implementation specific
  VIDEO_STREAM_PATTERNS: {IMAGE: /^$/, VIDEO: /^$/},

  OBJECT_LABEL: TRACKLET_TYPE,
  OBJECT_LABEL_COLOR_PALETTE: TRACKLET_COLOR_PALETTE,

  // PLUGIN METHODS
  getVehiclePose: logSlice => {
    return logSlice.getStream('vehicle-pose', null);
  },
  // secondary vehicle pose? or remove it?
  // could be another channel
  getGhostVehiclePose: logSlice => {
    return null;
  },
  getTrackedObjectPosition: (logSlice, trackedObjectId) => {
    return null;
  },
  postProcessMetadata: (metadata, data) => {
    if (data.styles) {
      metadata.styles = data.styles;
    }
  },
  postProcessVehiclePose: datum => {
    const vehiclePose = new Pose(datum);

    return {
      carPosition: datum,
      heading: (datum.yaw / Math.PI) * 180,
      vehiclePose: new Pose(datum),
      transformMatrix: vehiclePose.getTransformationMatrix()
    };
  },
  postProcessPrimitive: p => p,
  getObjectFeatures: logData => {
    // Find XVIZ object polygon features
    return logData.features.tracklets || [];
  },

  // atg specific
  // could be moved to `postProcessPose`
  annotateObjectFeatures: () => {},
  getLabelNameFromStream: stream => stream,
  getPrimitiveAnnotations: () => {},
  // isPointCloud,
  // filterPrimitive,
  observeObjects: () => {}

  // // TODO/OSS - should be removed
  // isSemanticColorStream,
};

setXvizConfig(XVIZ_CONFIG);
