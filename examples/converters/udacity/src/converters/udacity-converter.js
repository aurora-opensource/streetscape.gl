export default class UdacityConverter {
  constructor({disableStreams = []}) {
    this.disableStreams = disableStreams;
  }

  convertFrame(frame) {
    // Only extract message from each stream (topic)
    // `message` is the parsed data from `data` (binary)
    const streams = Object.keys(frame);
    streams
      .filter(streamName => !this.disableStreams.includes(streamName))
      .forEach(streamName => (frame[streamName] = frame[streamName].message));

    return frame;
  }
}
