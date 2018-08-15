*Uber Confidential Information*

# Streetscape.gl


## Development

### Dependencies

To build this repository you need:

 - Node.js, tested with 8.11.3, compatible with 8.x
 - Yarn, tested with 1.7.0, compatible with 1.x

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

### Test

Run tests under Node.js:

```bash
$ yarn test
```

Run tests in a browser:

```bash
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

```bash
$ cd examples/converters/kitti
$ yarn  # install dependencies
$ yarn start -d 2011_09_26/2011_09_26_drive_0005_sync
```

To see a full list of options of the converter, run `yarn start --help`.


### Start Demo Application

Start a XVIZ stream server:

```bash
$ cd examples/server
$ yarn  # install dependencies
$ yarn start -d kitti/2011_09_26/2011_09_26_drive_0005_sync
```

To see a full list of options of the stream server, run `yarn start --help`.

In another terminal, run the client app:

```bash
$ cd examples/clients/xviz-viewer
$ yarn  # install dependencies
$ yarn run start-local
```
