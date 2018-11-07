// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
