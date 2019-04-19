# Developer Viewer App

This app was based on the get-started app but with additional features for developers
to test all the features in XVIZ and Streetscape.gl

## Running the Viewer App

```bash
cd streetscape.gl/test/apps/viewer
# install dependencies
yarn
# start the app
yarn start
```

## Running an XVIZ server

```bash
cd streetscape.gl/modules/server
# start the app
./bin/babel-xvizserver -p 3000 -d ../directory/of/xviz-data
```
