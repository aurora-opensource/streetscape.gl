# Start Website Demo

The [Website Demo](https://github.com/uber/streetscape.gl/tree/master/examples/website-demo) is a
standalone app that provides a way to play around with the example dataset (kitti, nutonomy).

### Use example dataset from local

**Download dataset** Website demo app loads data files from remote github repo
[xviz-data](https://github.com/uber/xviz-data). You can also download dataset and run the app
locally,

```bash
# clone the repo
git clone https://github.com/uber/xviz-data.git
```

**Point to xviz-data location**

Default config assumes the `streetscape.gl` and `xviz-data` is under same directory.

```
-- directory/
    |-- streetscape.gl/
    |-- xviz-data/
```

If you would like to change the default config, check `webpack.config.js` file in
`streetscape.gl/examples/website-demo`. Modify the `contentBase` config to the actual `xviz-data`
location.

```bash
cd streetscape.gl/examples/website-demo
yarn start-local
```

## Running Website Demo

After `xviz-data` is downloaded to local and `webpack.config.js` is correctly setup.

```bash
# clone the repo
git clone https://github.com/uber/streetscape.gl.git
cd streetscape.gl/examples/website-demo
# install dependencies
yarn
# start the app
yarn start-local
```

### Convert Kitti and NuTonomy data into xviz protocol

`xviz-data` is converted from original [Kitti](http://www.cvlibs.net/datasets/kitti/raw_data.php)
and [NuTonomy](https://www.nuscenes.org/download) dataset. Please refer
[XVIZ examples](https://github.com/uber/xviz/tree/master/examples/converters/kitti) about data
converting details.
