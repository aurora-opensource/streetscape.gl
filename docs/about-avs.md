# AVS

Autonomous Visualization System, or AVS, is a set of projects that can be used to build tooling for
visualizing autonomous platforms.

The AVS projects are designed for applications and workflows that autonomy engineers and operators
work with to explore, analyze, and compare autonomous systems behavior and performance.

AVS focuses on gaps where we see the most need compared to existing tools.

- Ease of use
- Web Services and Applications
- Performance

## Components of AVS

### [XVIZ](https://github.com/uber/xviz/blob/master/docs/README.md)

XVIZ is a protocol for describing visual and metric data to provide a state view of the autonomous
system as well as the environment.

XVIZ also defines a protocol for communicating with a server to control and configure which data is
sent.

### [streetscape.gl](/docs/README.md)

streetscape.gl is our React Component Toolkit that powers the web applications provided as part of
AVS.

streetscape.gl provides components covering the range of functionality required to build XVIZ
powered web applications.

Specifically this includes:

- 3D Scene and Object Interaction
- Playback Controls
- 3D Navigation
- Chart and Tables
- Components for fetching XVIZ
- Map services integration
