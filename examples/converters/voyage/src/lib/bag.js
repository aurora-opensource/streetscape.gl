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
    function flushFrame() {
      if (frame.keyTopic) {
        onFrame(frame);
        frame = {};
      }
    }

    await this.bag.readMessages({topics: this.topics}, result => {
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
