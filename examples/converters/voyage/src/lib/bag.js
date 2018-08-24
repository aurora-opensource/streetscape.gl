/* global Buffer */
import {open} from 'rosbag';
import {quaternionToEuler} from '~/lib/util';

export default class Bag {
  constructor({bagPath, keyTopic, topics}) {
    this.bagPath = bagPath;
    this.keyTopic = keyTopic;
    this.topics = topics;
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
