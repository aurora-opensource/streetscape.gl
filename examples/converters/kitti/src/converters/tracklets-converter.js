import fs from 'fs';
import path from 'path';
import {_Pose as Pose} from 'math.gl';

import {getPoseOffset, generateTrajectoryFrame} from './utils';
import {loadTracklets} from '../parsers/parse-tracklets';

export default class TrackletsConverter {
  constructor(directory, getPose) {
    this.rootDir = directory;
    this.trackletFile = path.join(directory, 'tracklet_labels.xml');
    this.getPose = getPose;

    // laser scanner relative to GPS position
    // http://www.cvlibs.net/datasets/kitti/setup.php
    this.FIXTURE_TRANSFORM_POSE = {
      x: 0.81,
      y: -0.32,
      z: 1.73
    };

    this.TRACKLETS = '/tracklets/objects';
    this.TRACKLETS_TRAJECTORY = '/tracklets/trajectory';
    this.TRACKLETS_TRACKING_POINT = '/tracklets/tracking_point';
    this.TRACKLETS_LABEL = '/tracklets/label';
  }

  load() {
    const xml = fs.readFileSync(this.trackletFile, 'utf8');
    this.data = loadTracklets(xml);

    this.frameStart = this.data.objects.reduce((minFrame, obj) => {
      return Math.min(minFrame, obj.firstFrame);
    }, Number.MAX_SAFE_INTEGER);

    this.frameLimit = this.data.objects.reduce((maxFrame, obj) => {
      return Math.max(maxFrame, obj.lastFrame);
    }, 0);

    if (this.frameStart > this.frameLimit) {
      throw new Error('Invalid frame range');
    }

    this.trackletFrames = new Map();

    // Convert tracklets upfront to support trajectory
    for (let i = this.frameStart; i < this.frameLimit; i++) {
      this.trackletFrames.set(i, this._convertFrame(i));
    }
  }

  convertFrame(frameNumber, xvizBuilder) {
    const i = frameNumber;
    if (i < this.frameStart || i >= this.frameLimit) {
      return;
    }

    const tracklets = this.trackletFrames.get(i);
    tracklets.forEach(tracklet => {
      // Here you can see how the *classes* are used to tag the object
      // allowing for the *style* information to be shared across
      // categories of objects.
      xvizBuilder
        .stream(this.TRACKLETS)
        .polygon(tracklet.vertices)
        .classes([tracklet.objectType])
        .id(tracklet.id)

        .stream(this.TRACKLETS_TRACKING_POINT)
        .circle([tracklet.x, tracklet.y, tracklet.z])
        .id(tracklet.id)

        .stream(this.TRACKLETS_LABEL)
        // float above the object
        .position([tracklet.x, tracklet.y, tracklet.z + 2])
        .text(tracklet.id.slice(24));
    });

    for (let objectId = 0; objectId < this.data.objects.length; objectId++) {
      const object = this.data.objects[objectId];

      // object is in this frame
      if (i >= object.firstFrame && i < object.lastFrame) {
        const getTrackletsPrimitives = index => {
          const objects = this.trackletFrames.get(index);
          const tracklet = objects.find(x => x.id === object.properties.id);
          return tracklet;
        };

        const getTrajectory = traj => this._convertTrajectory(traj, i, this.getPose);
        const xvizTrajectory = generateTrajectoryFrame(
          i,
          Math.min(object.lastFrame, this.frameLimit),
          getTrackletsPrimitives,
          getTrajectory
        );

        xvizBuilder.stream(this.TRACKLETS_TRAJECTORY).polyline(xvizTrajectory);
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
      .pose(this.FIXTURE_TRANSFORM_POSE)

      .stream(this.TRACKLETS_TRACKING_POINT)
      .category('primitive')
      .type('circle')
      .styleClassDefault({
        radius: 0.2,
        fillColor: '#FFFF00'
      })
      .pose(this.FIXTURE_TRANSFORM_POSE)

      .stream(this.TRACKLETS_LABEL)
      .category('primitive')
      .type('text')
      .styleClassDefault({
        size: 18,
        fillColor: '#0040E0'
      })
      .pose(this.FIXTURE_TRANSFORM_POSE)

      .stream(this.TRACKLETS_TRAJECTORY)
      .category('primitive')
      .type('polyline')
      .styleClassDefault({
        strokeColor: '#FEC557',
        strokeWidth: 0.3,
        strokeWidthMinPixels: 1
      })
      .pose(this.FIXTURE_TRANSFORM_POSE);
  }

  _convertFrame(frameIndex) {
    return this.data.objects
      .map(object => {
        // out of bounds, return null
        if (frameIndex < object.firstFrame || frameIndex >= object.lastFrame) {
          return null;
        }

        const poseIndex = frameIndex - object.firstFrame;
        const pose = object.data.poses.item[poseIndex];

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
