/**
 * This class generates random data for use in the Declarative UI examples
 */
export default class RandomDataGenerator {
  constructor() {
    this.streams = {
      '/motion_planning/time': {
        category: 'variable',
        type: 'float',
        unit: 's'
      },
      '/motion_planning/trajectory/cost/cost1': {
        category: 'variable',
        type: 'float'
      },
      '/motion_planning/trajectory/cost/cost2': {
        category: 'variable',
        type: 'float'
      },
      '/motion_planning/trajectory/cost/cost3': {
        category: 'variable',
        type: 'float'
      }
    };
  }

  load() {}

  async convertFrame(frameNumber, xvizBuilder) {
    for (const streamName in this.streams) {
      const info = this.streams[streamName];
      const builder = xvizBuilder[info.category](streamName);

      if (streamName.indexOf('time') > 0) {
        builder.values(Array.from({length: 10}, (d, i) => i));
      } else if (info.category === 'variable') {
        const mean = Math.random() * 5;
        const deviation = Math.random() * 2;
        builder.values(Array.from({length: 10}, () => mean + Math.random(deviation)));
      }
    }
  }

  getMetadata(xvizMetaBuilder) {
    // You can see the type of metadata we allow to define.
    // This helps validate data consistency and has automatic
    // behavior tied to the viewer.
    const xb = xvizMetaBuilder;

    for (const streamName in this.streams) {
      const info = this.streams[streamName];
      xb.stream(streamName)
        .category(info.category)
        .type(info.type)
        .unit(info.unit || '');
    }
  }
}
