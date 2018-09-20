# Development

*Uber Confidential Information*


## Installing Dependencies

To build this repository you need:

 - Node.js, tested with 8.11.3, compatible with 8.x
 - Yarn, tested with 1.7.0, compatible with 1.x

To install dependencies, run:

```
# Pull and build XVIZ locally
# TODO - remove when XVIZ is published to npm
$ git clone https://github.com/uber/xviz.git
$ cd xviz
$ yarn
$ yarn build
$ cd ..

# Set up streetscape.gl
$ git clone https://github.com/uber/streetscape.gl.git
$ cd streetscape.gl
$ npm run bootstrap
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


## Contributions

streetscape.gl welcomes contributions. If you have an idea, it is always a good idea to open a github issue to get some feedback before you start implementing, to make sure maintainers are ready to accept it.
