# Streetscape.gl

*Uber Confidential Information*


## Development

### Dependencies

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

### Test

Run tests under Node.js:

```
$ yarn test
```

Run tests in a browser:

```
$ yarn test-browser
```

## Run Demo with the KITTI Dataset

### Download Raw Data

Download raw data from [KITTI website](http://www.cvlibs.net/datasets/kitti/raw_data.php). For each dataset you'll need to download the `synced+rectified data` and the `tracklets` files. Extract to the `data/kitti` directory in this project. It will look like this:

```
/data/kitti
    |- 2011_09_26
        |- 2011_09_26_drive_0005_sync
            |- tracklet_labels.xml
            |- image_00
            |- image_01
            |- image_02
            |- image_03
            |- oxts
            |- velodyne_points
```

### Convert KITTI to XVIZ Format

```
$ cd examples/converters/kitti
$ yarn  # install dependencies
$ yarn start -d 2011_09_26/2011_09_26_drive_0005_sync
```

To see a full list of options of the converter, run `yarn start --help`.


### Start Demo Application

Start a XVIZ stream server:

```
$ cd examples/server
$ yarn  # install dependencies
$ yarn start -d kitti/2011_09_26/2011_09_26_drive_0005_sync
```

To see a full list of options of the stream server, run `yarn start --help`.

Add an application config file
```
$ cd examples/clients/config
```

- An example is xviz-config-kitti.js, for complete xviz configs, check [xviz-config](https://github.com/uber/xviz/blob/master/docs/api-reference/xviz-configuration.md)
- Config file naming convention: xviz-config-${appName}.js
- `appName` is used for loading the correct configuration file for the client app (default is `kitti`).

In another terminal, run the client app:

```
$ cd examples/clients/xviz-viewer
$ yarn  # install dependencies
$ appName=kitti yarn start-local
```

