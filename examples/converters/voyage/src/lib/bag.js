/* global Buffer */
import _ from 'lodash';
import * as turf from '@turf/turf';
import {open} from 'rosbag';
import {quaternionToEuler} from '~/lib/util';

const ORIGINS = [
  /* VGCC */
  {
    latitude: 37.290493011474609375,
    longitude: -121.753868103027343750,
    altitude: 204.159072875976562500
  },
  /* VGFL */
  {
    latitude: 28.89434334079586,
    longitude: -81.96993993906564,
    altitude: -6.502784252166748
  },
  /* Springfield */
  {
    latitude: 37.3059663,
    longitude: -121.75191,
    altitude: 0
  }
];

export default class Bag {
  constructor({bagPath, keyTopic, topics}) {
    this.bagPath = bagPath;
    this.keyTopic = keyTopic;
    this.topics = topics;
  }

  /**
   * Determines the map origin by finding the origin the /gps/fix messages are closest to
   */
  async calculateOrigin() {
    const bag = await open(this.bagPath);
    let origin = {latitude: 0, longitude: 0, altitude: 0};
    await bag.readMessages({topics: ['/gps/fix']}, ({message}) => {
      origin = _.minBy(ORIGINS, ({longitude, latitude}) => {
        return turf.distance(
          turf.point([longitude, latitude]),
          turf.point([message.longitude, message.latitude])
        )
      });
    });

    return origin;
  }

  // This maps a frameId to a pose
  // NOTE: This only calculates the last pose transform versus walking the full tree to
  // calculate the overall pose. This works for us in the short term as all the poses we care
  // about are from base_link.
  async calculateFrameIdToPoseMap() {
    const bag = await open(this.bagPath);
    const frameIdToPoseMap = {};
    await bag.readMessages({topics: ['/tf']}, ({message}) => {
      message.transforms.forEach((t) => {
        frameIdToPoseMap[t.child_frame_id] = {
          ...t.transform.translation,
          ...quaternionToEuler(t.transform.rotation)
        }
      });
    });

    return frameIdToPoseMap;
  }

  // We synchronize frames along messages in the `keyTopic`.
  async readFrames(onFrame) {
    const bag = await open(this.bagPath);

    let frame = {};
    function flushFrame() {
      if (frame.keyTopic) {
        onFrame(frame);
        frame = {};
      }
    }

    await bag.readMessages({topics: this.topics}, result => {
      // rosbag.js reuses the data buffer for subsequent messages, so we need to make a copy
      if (result.message.data) {
        result.message.data = Buffer.from(result.message.data);
      }
      if (result.topic === this.keyTopic) {
        flushFrame();
        frame.keyTopic = result;
      }
      frame[result.topic] = frame[result.topic] || [];
      frame[result.topic].push(result);
    });

    // Flush the final frame
    flushFrame();
  }
}
