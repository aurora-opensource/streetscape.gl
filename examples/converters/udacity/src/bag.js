import {open} from 'rosbag';

export default class Bag {
  constructor({bagPath, keyTopic, topics}) {
    this.bagPath = bagPath;
    this.keyTopic = keyTopic;
    this.topics = topics;

    this.allTopics = null;
  }

  async open() {
    this.bag = await open(this.bagPath);
  }

  async getAllTopics() {
    if (this.allTopics) {
      return this.allTopics;
    }

    if (!this.bag) {
      await this.open();
    }

    const connections = this.bag.connections;
    this.allTopics = Object.keys(connections).map(id => connections[id].topic);

    return this.allTopics;
  }

  // We synchronize frames along messages in the `keyTopic`.
  async readFrames(onFrame) {
    if (!this.bag) {
      await this.open();
    }

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
