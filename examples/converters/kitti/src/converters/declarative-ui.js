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

import {XVIZUIBuilder} from '@xviz/builder';

export function getDeclarativeUI() {
  const builder = new XVIZUIBuilder({});

  builder.child(getMetricsPanel(builder));
  builder.child(getPlotPanel(builder));

  return builder;
}

function getMetricsPanel(builder) {
  const panel = builder.panel({
    name: 'Metrics'
  });

  const container = builder.container({
    name: 'Metrics Panel',
    layout: 'vertical'
  });

  const metricAcceleration = builder.metric({
    title: 'Acceleration',
    streams: ['/vehicle/acceleration'],
    description: 'The acceleration of the vehicle'
  });

  const metricVelocity = builder.metric({
    title: 'Velocity',
    streams: ['/vehicle/velocity'],
    description: 'The velocity of the vehicle'
  });

  container.child(metricAcceleration).child(metricVelocity);
  panel.child(container);

  return panel;
}

function getPlotPanel(builder) {
  const panel = builder.panel({
    name: 'Planning'
  });

  const plot = builder.plot({
    title: 'Cost',
    description: 'Costs considered in planning the vehicle trajectory',
    independentVariable: '/motion_planning/time',
    dependentVariable: [
      '/motion_planning/trajectory/cost/cost1',
      '/motion_planning/trajectory/cost/cost2',
      '/motion_planning/trajectory/cost/cost3'
    ]
  });

  panel.child(plot);

  return panel;
}
