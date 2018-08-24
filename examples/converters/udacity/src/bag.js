import {open} from 'rosbag';

export default class Bag {
  constructor({bagPath, keyTopic, topics}) {
    this.bagPath = bagPath;
    this.keyTopic = keyTopic;
    this.topics = topics;
  }

  // We synchronize frames along messages in the `keyTopic`.
  async readFrames(onFrame) {
    this.bag = await open(this.bagPath);

    let frame = {};

    await this.bag.readMessages({topics: this.topics}, result => {
      // rosbag.js reuses the data buffer for subsequent messages, so we need to make a copy
      // We synchronize frames along messages in the `keyTopic`.
      if (result.topic === this.keyTopic) {
        onFrame(frame);
        frame = {};
      }
      frame[result.topic] = result;
    });

    // Flush the final frame
    onFrame(frame);
  }
}
