# Docs

**[kitti dataset](http://www.cvlibs.net/datasets/kitti/raw_data.php)**

**[python lib](https://github.com/utiasSTARS/pykitti)**

**[Jupyter notebook](https://github.com/navoshta/KITTI-Dataset/blob/master/kitti-dataset.ipynb)**

**[wiki](https://docs.google.com/document/d/1KHd25B2Jod1XUlhm19NCVPERzr5Qg6vpIO2-xYGZadQ/edit#)**

**[worklog](https://docs.google.com/document/d/1cRM1_RnpSIP87MSL5mDr7LCvDe85eG-_aHT0_JRIgCs/edit)**

# Development
### Environment
```
nvm use 8.9.4 (or higher)
```

### Download data
Go to **[kitti dataset](http://www.cvlibs.net/datasets/kitti/raw_data.php)**, select any category and drive you are interested in. Need download 3 archives
```[synced+rectified data] [calibration] [tracklets]```

Unzip these archives and put it in `./prototype/data` directory

## Transform Kitti to xviz format
```
cd <path-to-jskitti-root-dir>
node --max-old-space-size=4096 kitti/transform.js --root=./data --date=2011_09_26 --drive=0005 --outdir=./prototype-xviz/data --disable-streams=lidar-points,vehicle-pose-trajectory
```
##### available streams
```
  vehicle-pose,
  velocity,
  acceleration,
  lidar-points,
  tracklets,
  vehicle-pose-trajectory,
  tracklets-trajectory
```

```
// directory structure 
|--data
     |--2011_09_26     
            |--2011_09_26_drive_005_sync                    // synced original data
            |             |--oxts                           // GPS data  
            |             |    |--data               
            |             |    |   |--0000000000.txt        // per frame per file
            |             |    |   |--...
            |             |    |--timestamps.txt
            |             |--velodyne_points
            |             |         |--data
            |             |         |    |--0000000000.bin
            |             |         |    |--...
            |             |         |--timestamps.txt
            |             |--tracklet_labels.xml  
            |--generated                                    // generated data dir
                   |--0                                     // per frame per folder
                      |--0-frame.json                       // per frame per json file
                   |--1
                      |--1-frame.json
```

## Demo

```
cd prototype
yarn install
yarn start
```

## Demo with XVIZ server

You need run transform script first refer ```Transform Kitti to xviz format``` section

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
