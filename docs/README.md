# Streetscape.gl

*Uber Confidential Information*

streetscape.gl is a visualization application (and framework) for autonomy and robotics data encoded in the XVIZ protocol. It also supports visualization of local geospatial data such as point clouds, lane graphs and imagery, and it can display the dynamic, streamed XVIZ data with th.


## References

* [XVIZ](http://xviz.org) - Protocol for visualization of autonomy and robotics data.
* [deck.gl](http://deck.gl) - The geospatial visualization framework that streetscape.gl is built on.
* [vis.gl](http://vis.gl) - streetscape.gl is part the vis.gl suite of visualization frameworks.


## Features

* Visualizes dynamic XVIZ visualization data, enabling you to stream XVIZ data starting from a certain timestamp.
* Support unlimited time playback and seeking forwards and backwards in time.
* Supports the XVIZ declarative UI, allowing your backend or on-robot systems include extensive debug data in e.g. tree or tabular format.
* The sample application is built from a documented set of React UI component, intended to make customization to specific used cases as easy as possible.
