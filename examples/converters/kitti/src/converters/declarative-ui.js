import {XVIZUIBuilder} from '@xviz/builder';

export function getDeclarativeUI() {
  const builder = new XVIZUIBuilder({});

  builder.child(getMetricsPanel(builder));
  builder.child(getPlotPanel(builder));
  builder.child(getVideoPanel(builder));
  builder.child(getTablePanel(builder));

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

  container.child(metricAcceleration);
  container.child(metricVelocity);
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
    dependentVariables: [
      '/motion_planning/trajectory/cost/cost1',
      '/motion_planning/trajectory/cost/cost2',
      '/motion_planning/trajectory/cost/cost3'
    ]
  });

  panel.child(plot);

  return panel;
}

function getVideoPanel(builder) {
  const panel = builder.panel({
    name: 'Camera'
  });

  const video = builder.video({
    cameras: ['/camera/image_00', '/camera/image_01', '/camera/image_02', '/camera/image_03']
  });

  panel.child(video);

  return panel;
}

function getTablePanel(builder) {
  const panel = builder.panel({
    name: 'Perception'
  });

  const table = builder.treetable({
    title: 'Perception',
    description: 'Objects identified by perception',
    stream: '/perception/objects/table',
    displayObjectId: true
  });

  panel.child(table);

  return panel;
}
