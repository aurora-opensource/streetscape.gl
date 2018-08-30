const fs = require('fs');
const path = require('path');

import {getPoseOffset} from './common';
const {_Pose: Pose} = require('math.gl');

import {generateTrajectoryFrame} from './common';

import {loadTracklets} from '../parsers/parse-tracklets';

export default class TrackletsConverter {
  constructor(directory, getPose) {
    this.root_dir = directory;
    this.tracklet_file = path.join(directory, 'tracklet_labels.xml');
    this.getPose = getPose;

    this.TRACKLETS = '/tracklets/objects';
    this.TRACKLETS_TRAJECTORY = '/tracklets/trajectory';
  }

  load() {
    const xml = fs.readFileSync(this.tracklet_file, 'utf8');
    this.data = loadTracklets(xml);

    this.frame_start = this.data.objects.reduce((min_frame, obj) => {
      return Math.min(min_frame, obj.first_frame);
    }, Number.MAX_SAFE_INTEGER);

    this.frame_limit = this.data.objects.reduce((max_frame, obj) => {
      return Math.max(max_frame, obj.last_frame);
    }, 0);

    if (this.frame_start > this.frame_limit) {
      throw new Error('Invalid frame range');
    }

    this.tracklet_frames = new Map();

    // Convert tracklets upfront to support trajectory
    for (let i = this.frame_start; i < this.frame_limit; i++) {
      this.tracklet_frames.set(i, this._convertFrame(i));
    }
  }

  convertFrame(frameNumber, xvizBuilder) {
    const i = frameNumber;
    if (i < this.frame_start || i >= this.frame_limit) {
      return;
    }

    const tracklets = this.tracklet_frames.get(i);
    tracklets.forEach(tracklet => {
      // Here you can see how the *classes* are used to tag the object
      // allowing for the *style* information to be shared across
      // categories of objects.
      xvizBuilder
        .stream(this.TRACKLETS)
        .polygon(tracklet.vertices)
        .classes([tracklet.objectType])
        .id(tracklet.id);
    });

    for (let object_id = 0; object_id < this.data.objects.length; object_id++) {
      const object = this.data.objects[object_id];

      // object is in this frame
      if (i >= object.first_frame && i < object.last_frame) {
        const getTrackletsPrimitives = index => {
          const objects = this.tracklet_frames.get(index);
          const tracklet = objects.find(x => x.id === object.properties.id);
          return tracklet;
        };

        const getTrajectory = traj => this._convertTrajectory(traj, i, this.getPose);
        const xviz_trajectory = generateTrajectoryFrame(
          i,
          Math.min(object.last_frame, this.frame_limit),
          getTrackletsPrimitives,
          getTrajectory
        );

        xvizBuilder.stream(this.TRACKLETS_TRAJECTORY).polyline(xviz_trajectory);
      }
    }
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.TRACKLETS)
      .category('primitive')
      .type('polygon')
      .styleClassDefault({
        extruded: true,
        wireframe: true,
        // TODO - use dynamic height
        height: 1.5,
        fillColor: '#00000080'
      })
      .styleClass('Car', {
        fillColor: '#7DDDD780',
        strokeColor: '#7DDDD7'
      })
      .styleClass('Cyclist', {
        fillColor: '#DA70BF80',
        strokeColor: '#DA70BF'
      })
      .styleClass('Pedestrian', {
        fillColor: '#FEC56480',
        strokeColor: '#FEC564'
      })
      .styleClass('Van', {
        fillColor: '#267E6380',
        strokeColor: '#267E63'
      })
      .styleClass('Unknown', {
        fillColor: '#D6A00080',
        strokeColor: '#D6A000'
      })
      // laser scanner relative to GPS position
      // http://www.cvlibs.net/datasets/kitti/setup.php
      .pose({
        x: 0.81,
        y: -0.32,
        z: 1.73
      })

      .stream(this.TRACKLETS_TRAJECTORY)
      .category('primitive')
      .type('polyline')
      .styleClassDefault({
        strokeColor: '#FEC557',
        strokeWidth: 0.3,
        strokeWidthMinPixels: 1
      })
      // laser scanner relative to GPS position
      // http://www.cvlibs.net/datasets/kitti/setup.php
      .pose({
        x: 0.81,
        y: -0.32,
        z: 1.73
      });
  }

  _convertFrame(frame_index) {
    return this.data.objects
      .map(object => {
        // out of bounds, return null
        if (frame_index < object.first_frame || frame_index >= object.last_frame) {
          return null;
        }

        const pose_index = frame_index - object.first_frame;
        const pose = object.data.poses.item[pose_index];

        const poseProps = {
          x: Number(pose.tx),
          y: Number(pose.ty),
          z: Number(pose.tz),
          roll: Number(pose.rx),
          pitch: Number(pose.ry),
          yaw: Number(pose.rz)
        };

        const transformMatrix = new Pose(poseProps).getTransformationMatrix();

        return {
          ...object.properties,
          ...poseProps,
          vertices: object.bounds.map(p => transformMatrix.transformVector(p))
        };
      })
      .filter(Boolean);
  }

  _convertTrajectory = (motions, initialFrame) => {
    const vertices = [];
    const initialVehiclePose = this.getPose(initialFrame);

    for (let i = 0; i < motions.length; i++) {
      const t = motions[i];
      const currVehiclePose = this.getPose(initialFrame + i);

      const [x, y] = getPoseOffset(initialVehiclePose, currVehiclePose);

      const transformMatrix = new Pose(currVehiclePose).getTransformationMatrixFromPose(
        new Pose(initialVehiclePose)
      );

      // tracklets in curr frame are meters offset based on current vehicle pose
      // need to convert to the coordinate system of the last vehicle pose
      const p = transformMatrix.transformVector([t.x, t.y, t.z]);
      vertices.push([p[0] + x, p[1] + y, p[2]]);
    }

    return vertices;
  };
}
