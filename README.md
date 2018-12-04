_Uber Confidential Information_

# streetscape.gl

### Dependencies

To build this repository you need:

- Node.js, tested with 8.11.3, compatible with 8.x
- Yarn, tested with 1.7.0, compatible with 1.x

## Quick start

Set up to run KITTI XVIZ example

```bash
# Set up XVIZ
# TODO - remove when XVIZ is published to npm
$ git clone https://github.com/uber/xviz.git

# Set up streetscape.gl
$ git clone https://github.com/uber/streetscape.gl.git
$ cd streetscape.gl

# Install dependencies and build projects
$ yarn bootstrap

# Download KITTI data
$ ./scripts/download-kitti-data.sh

# Convert KITTI data if necessary and run the XVIZ Server and Client
$ ./scripts/run-kitti-example.sh
```

## Documentation

To read the documentation look in the docs folder (e.g. locally or on github), or build and run the
website:

```
yarn
cd website
yarn
yarn start
```

## Development

To install dependencies, run:

```bash
# Pull and build XVIZ locally
# TODO - remove when XVIZ is published to npm
$ git clone https://github.com/uber/xviz.git
$ cd xviz
$ yarn bootstrap
$ cd ..

# Set up streetscape.gl
$ git clone https://github.com/uber/streetscape.gl.git
$ cd streetscape.gl
$ yarn bootstrap
```

## Coding Standard

xviz uses a pinned version of the
[uber-es2015](https://www.npmjs.com/package/eslint-config-uber-es2015) linter rules.
