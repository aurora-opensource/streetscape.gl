# Installing

## Modules

To work with streetscape.gl in JavaScript you'll want to install npm modules to get access to a
specific release of the streetscape.gl framework.

The two main modules are:

| NPM Module       | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `streetscape.gl` | Framework classes for loading and visualizing XVIZ formatted data |
| `@xviz/parser`   | Classes for parsing XVIZ                                          |

Apart from the two main modules your streetscape.gl app may end up importing and using a number of
other modules. To help you get oriented quickly, here are some examples.

| NPM Module                   | Description                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `@xviz/builder`              | Classes that help data converters generate correct XVIZ code.                                            |
| `@xviz/schema`               | JSON schemas used to validate that JSON encoded XVIZ data                                                |
| `deck.gl`                    | The geospatial rendering framework that streetscape.gl is built on.                                      |
| `luma.gl`                    | High-Performance WebGL2 components that powers deck.gl rendering.                                        |
| `math.gl`                    | 3D math library in the vis.gl suite. Used by xviz, streetscape.gl, deck.gl etc.                          |
| `react-vis`                  | vis.gl charting library used by streetscape.gl                                                           |
| `react-map-gl`               | vis.gl react wrapper for mapboxgl. Declarative API for maps                                              |
| `mapboxgl`                   | Mapbox GL map library, used to render the base map                                                       |
| `@streetscape.gl/monochrome` | A set of React components many of which are used by streetscape.gl and other autonomous web applications |
| `react`                      | Facebook's react library, the generic parts                                                              |
| `react-dom`                  | Facebook's react library, the part that renders into the browser DOM                                     |

You may also want to head over to [vis.gl](http://vis.gl) to get a sense for other frameworks in the
vis.gl framework suite which streetscape.gl and xviz are part of. These frameworks are all
compatible and are recommended choices if you need to add new functionality to your streetscape.gl
apps.

## Installation

A good first step is usually installing `streetscape.gl` and `xviz` in the root directory of your
application:

```
cd my-application-directory
npm install streetscape.gl @xviz/parser
# or
yarn add streetscape.gl @xviz/
```

This will update (or create, if you don't already have one) a `package.json file`. Then it will add
the names of the two packages to the `"dependencies"` section in `package.json`, and install the
contents of the packages in your `node_modules` sub-folder.

## Developing Visualization Applications

Installing the modules above gives you access to the APIs documented in this repository. See the
separate article on building custom applications.

## Converting Data to XVIZ in JavaScript

If you have data that you need to convert to XVIZ format, you may want to create node scripts and
you will want to install `xviz`.

```
npm install @xviz/builder
# or
yarn add xviz
```

See the separate article on converting data to XVIZ.
