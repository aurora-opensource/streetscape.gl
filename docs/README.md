# streetscape.gl

streetscape.gl is a visualization toolkit for autonomy and robotics data encoded in the
[XVIZ protocol](https://github.com/uber/xviz/blob/master/docs/README.md). It offers a collection of
composable React components that let users visualize and interact with XVIZ data.

![UI Components](./images/ui-controls.png)

## Features

- Load XVIZ data from static files or a stream server.
- Visualize dynamic XVIZ data in a fully interactive 3D context.
  - Overlay with base map - put your data in the real world context
  - Navigate the viewport: pan, rotate, zoom
  - Select objects to display additional annotation
  - Turn on/off primitive streams
  - Customize camera modes: top down, perspective, driver, etc.
- Playback logs of unlimited length, seek forwards and backwards in time.
- Render XVIZ
  [declarative UI](https://github.com/uber/xviz/blob/master/docs/declarative-ui/overview.md),
  allowing your backend or on-robot systems define UI components for debugging, such as interactive
  tables, plots, and videos.
- Prioritize performance and memory efficiency.
- All components are highly stylable.
