# Docs

References

**[wiki](https://docs.google.com/document/d/1KHd25B2Jod1XUlhm19NCVPERzr5Qg6vpIO2-xYGZadQ/edit#)**
**[worklog](https://docs.google.com/document/d/1cRM1_RnpSIP87MSL5mDr7LCvDe85eG-_aHT0_JRIgCs/edit)**



## Development

### Environment
```
nvm use 8.9.4 (or higher)
```


## Data Sets



## Demo with XVIZ server

You need run transform script first refer ```Transform Kitti to XVIZ format``` section


### start xviz stream server

Execute /src/xviz-serve-data.js from the data directory. E.g.
```
cd prototype-xviz/data/2011_09_26_drive_0005_sync
node ../../../src/xviz-serve-data.js 
```

### start app
```
cd prototype-xviz
yarn install
yarn start
```



## Outdated Instructions

These instructions no longer appear to work, keeping here for now.

### Visualize point-cloud-demo
```
cd point-cloud-demo
yarn install

// there is some issue with this version of deck.gl
// temoporary solution is 
// go to point-cloud-demo/node_modules/@deck.gl/core/dist/esm/core-layers
// and delete `export{default as TextLayer}from"./text-layer/text-layer";`

npm run start
```


### Parse oxts file (vehicle pose)
```
open file src/parse-gps-data.js

// from your terminal
node src/src/parse-gps-data.js
// then you should be able to see the parsed vehicl-pose.json file in ./point-cloud-demo/data/generated
```
s
