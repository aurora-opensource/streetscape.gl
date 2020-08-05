# Raven Setup Steps

## Notes

1. This visualization requires two parts: a) https://github.com/Smart-Ag/streetscape.gl b)
   https://github.com/Smart-Ag/xviz
2. a) is the front end code
3. b) is the back end code

## To Install

```bash
$ install node v11.12.0 (curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash)
$ nvm install 11.12.0
$ nvm use 11.12.0
$ git clone https://github.com/uber/streetscape.gl.git
$ cd streetscape.gl
$ npm run bootstrap
```

## To Run

```bash
$ cd xviz/examples/get-started
$ npm run start-live
```

# streetscape.gl

streetscape.gl is a toolkit for visualizing autonomous and robotics data in the
[XVIZ](https://github.com/uber/xviz) protocol. It is built on top of React and Uber’s
[WebGL-powered visualization frameworks](http://vis.gl).

![UI Components](docs/images/ui-controls.png)

## Install

```bash
npm install streetscape.gl
# or
yarn add streetscape.gl
```

## Documentation and demo

[AVS Website](http://avs.auto)

## Quick start

You need [Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/lang/en/docs/install) to
run the [example app](examples/get-started).

```bash
# Clone streetscape.gl
$ git clone https://github.com/uber/streetscape.gl.git
$ cd streetscape.gl

# Install dependencies
$ yarn bootstrap

# Run example
$ cd examples/get-started
$ yarn
$ yarn start
```

## Contributions

streetscape.gl welcomes contributions. If you have an idea, open a Github issue to get some feedback
before you start implementing, to make sure that the maintainers are ready to accept it.
