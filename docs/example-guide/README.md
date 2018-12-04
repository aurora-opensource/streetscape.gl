# Example Guide

![streetscape.gl](streetscape-mini.gif)

The example guide describes the KITTI dataset and viewing web application. It provides a starting
point for understanding how data is converted to XVIZ and accessed in the browser to quickly
visualize and explore your data.

## Features

Many key features can be observed in the image above, including:

- playback controls
- timeline
- charts
- images
- base maps

If you have the example running locally, be sure to experiment with the controls:

- Mouse controls

  - shift + click => rotate
  - option + click => rotate
  - command + click => rotate
  - click => pan
  - wheel/pinch => zoom

- Object interactions
  - click on charts to jump to time
  - click on rectangles to select and show context info

### How is data served, the XVIZ Server

This example is using a simple Websocket server to send the data to the browser. This is intended to
be for demonstration purposes. The data is time ordered, and could use plain HTTP or other
transports as necessary.

### XVIZ Server Limitations

- stream filtering
- point cloud compression
- dynamic XVIZ conversion
