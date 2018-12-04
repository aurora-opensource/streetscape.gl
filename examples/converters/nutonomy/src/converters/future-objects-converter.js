/* eslint-disable camelcase */
import {parseJsonFile} from '../common';
import {COORDINATE} from 'streetscape.gl';

import {OBJECT_PALATTE} from './objects-converter';
import {loadObjects} from '../parsers/parse-objects';

export default class FutureObjectsConverter {
  constructor(rootDir, streamFile) {
    this.rootDir = rootDir;
    this.streamFile = streamFile;
    this.objectsByFrame = {};
    this.timestamps = [];

    this.OBJECTS_FUTURES = '/objects/futures';
  }

  // sample_token is unique id for a log sample
  // instance_token is unique id for an object across different frames of the sample
  load({staticData, posesByFrame, frames}) {
    const objects = parseJsonFile(this.rootDir, this.streamFile);
    this.objectsByFrame = loadObjects(objects, staticData.instances);

    // object trajectory is in pose relative coordinate
    this.posesByFrame = posesByFrame;
    this.frames = frames;
  }

  convertFrame(frameIndex, xvizBuilder) {
    // Generate predictions for 10 frames
    const futureFrameLimit = Math.min(frameIndex + 10, this.frames.length);

    for (let i = frameIndex; i < futureFrameLimit; i++) {
      const objects = this._convertObjectsFutureFrame(frameIndex, i);
      const frameToken = this.frames[frameIndex].token;
      const pose = this.posesByFrame[frameToken];

      objects.forEach(object => {
        const future_ts = pose.timestamp;
        xvizBuilder
          .futureInstance(this.OBJECTS_FUTURES, future_ts)
          .polygon(object.vertices.map(v => [v.x, v.y, 0]))
          .classes([object.objectType])
          .id(object.id);
      });
    }
  }

  getMetadata(xvizMetaBuilder, {staticData}) {
    const {categories} = staticData;
    const xb = xvizMetaBuilder;
    xb.stream(this.OBJECTS_FUTURES)
      .category('future_instance')
      .type('polygon')
      .coordinate(COORDINATE.IDENTITY)

      .streamStyle({
        stroke_width: 0.1,
        extruded: false,
        wireframe: true,
        fill_color: '#00000080'
      });

    Object.values(categories).forEach(category => {
      xb.styleClass(category.streamName, OBJECT_PALATTE[category.streamName]);
    });
  }

  // create set of data for the currentFrameIndex that represents the objects from the futureFrameIndex
  _convertObjectsFutureFrame(currentFrameIndex, futureFrameIndex) {
    const futureFrameToken = this.frames[futureFrameIndex].token;
    const futureObjects = this.objectsByFrame[futureFrameToken];
    return Object.values(futureObjects);
  }
}
