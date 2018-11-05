import {XVIZUIBuilder} from '@xviz/builder';

export function getDeclarativeUI() {
  const builder = new XVIZUIBuilder({});

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
  builder.child(panel);

  return builder;
}
