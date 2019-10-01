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
import React from 'react';
import {number, text} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/react';
import {withReadme} from 'storybook-readme';

import README from './README.md';
import {MetricCard, MetricChart, RichMetricChart} from './index';

const sampleData = {
  'Series 1': Array.from({length: 101}, (d, i) => {
    const x = i / 25;
    return [x, Math.sin(x * Math.PI)];
  }),
  'Series 2': Array.from({length: 101}, (d, i) => {
    const x = i / 25;
    return [x, Math.cos(x * Math.PI)];
  }),
  'Series 3': Array.from({length: 101}, (d, i) => {
    const x = i / 25;
    return [x, Math.sin(x * Math.PI) + 0.1, Math.sin(x * Math.PI) - 0.1];
  })
};

const lineColors = {
  'Series 1': '#004b78',
  'Series 2': '#907700',
  'Series 3': 'rgba(0, 80, 245, 0.5)'
};

const style = {
  margin: {left: 48, right: 20, top: 20, bottom: 48},
  crosshair: {
    background: 'rgba(0, 0, 0, 0.8)'
  }
};

const sampleData2 = {};

for (let k = 1; k <= 10; k++) {
  sampleData2[`Series ${k}`] = Array.from({length: 101}, (d, i) => {
    const x = i / 50;
    return [x, Math.pow(x, k / 2)];
  });
}

storiesOf('MetricCard', module)
  .addDecorator(withReadme(README))
  .add('Basic example', () => (
    <MetricCard title="Example Metric Card" description="This is an example metric card">
      <MetricChart
        height={200}
        style={style}
        data={sampleData}
        unit={text('unit', 'm/s')}
        getX={d => d[0]}
        getY={d => d[1]}
        getY0={d => d[2]}
        getColor={lineColors}
        formatTitle={title => title}
        formatValue={v => v.toFixed(3)}
        formatXTick={x => `${x}π`}
        xTicks={number('xTicks', 3, {range: true, min: 0, max: 10, step: 1})}
        yTicks={number('yTicks', 5, {range: true, min: 0, max: 10, step: 1})}
        horizontalGridLines={number('horizontalGridLines', 5, {
          range: true,
          min: 0,
          max: 10,
          step: 1
        })}
        verticalGridLines={number('verticalGridLines', 0, {range: true, min: 0, max: 10, step: 1})}
        highlightX={0}
      />
    </MetricCard>
  ))
  .add('Loading', () => (
    <MetricCard
      title="Example Metric Card"
      description="This is an example metric card loading"
      isLoading={true}
    />
  ))
  .add('Error', () => (
    <MetricCard
      title="Example Metric Card"
      description="This is an example metric card with error"
      error="Cannot load data"
    />
  ))
  .add('Chart with filters', () => (
    <MetricCard title="Example Plot" description="This is an example plot">
      <RichMetricChart
        height={400}
        style={style}
        data={sampleData2}
        unit={text('unit', 'm/s')}
        getX={d => d[0]}
        getY={d => d[1]}
        formatTitle={title => title}
        formatValue={v => v.toFixed(3)}
        xTicks={number('xTicks', 3, {range: true, min: 0, max: 10, step: 1})}
        yTicks={number('yTicks', 5, {range: true, min: 0, max: 10, step: 1})}
        horizontalGridLines={number('horizontalGridLines', 5, {
          range: true,
          min: 0,
          max: 10,
          step: 1
        })}
        verticalGridLines={number('verticalGridLines', 0, {range: true, min: 0, max: 10, step: 1})}
        highlightX={0}
      />
    </MetricCard>
  ));
