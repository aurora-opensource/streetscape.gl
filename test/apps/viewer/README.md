# Developer Viewer App

This is an application to enable testing and validation of all the features of XVIZ and Streetscape.gl

## Running the Viewer App

```bash
cd streetscape.gl/test/apps/viewer
# install dependencies
yarn
# start the app
yarn start-streaming
```

## Running an XVIZ server

```bash
cd xviz/modules/server
# start the server 
./bin/babel-xvizserver -d ../directory/of/xviz-data
```
