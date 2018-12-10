_Uber Confidential Information_

# streetscape.gl

### Dependencies

To build this repository you need:

- Node.js, tested with 8.11.3, compatible with 8.x
- Yarn, tested with 1.10.0, compatible with 1.x

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

# Run example
$ cd examples/xviz-viewer
$ yarn
$ yarn start-local
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

## Test

Run tests under Node.js:

```
$ yarn test
```

Run tests in a browser:

```
$ yarn test-browser
```

## Dependency setup for Local Development

To improve the development flow while working on both XVIZ and streetscape.gl it is useful to
directly link the dependencies rather than use packages.

We have some utility script to use yarn linking between XVIZ

### Setup yarn link

Assumes your environment is already setup following the _Quick Start_ sequence.

```
$ ./scripts/dev-link-dependencies.sh link
```

### Remove yarn link

This will remove the yarn link, then run yarn again to make sure your packages correctly installed.

```
$ ./scripts/dev-link-dependencies.sh link
$ yarn bootstrap
```

## Contributions

streetscape.gl welcomes contributions. If you have an idea, it is always a good idea to open a
github issue to get some feedback before you start implementing, to make sure maintainers are ready
to accept it.

## Coding Standard

xviz uses a pinned version of the
[uber-es2015](https://www.npmjs.com/package/eslint-config-uber-es2015) linter rules.
