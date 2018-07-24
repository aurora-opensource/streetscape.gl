### KITTY Data Set

* [kitti dataset](http://www.cvlibs.net/datasets/kitti/raw_data.php)**

* [python lib](https://github.com/utiasSTARS/pykitti)
* [Jupyter notebook](https://github.com/navoshta/KITTI-Dataset/blob/master/kitti-dataset.ipynb)


### Download Kitty Data

1. Go to **[kitti dataset](http://www.cvlibs.net/datasets/kitti/raw_data.php)**
2. Select any category and drive you are interested in
3. Download 3 archives: `[synced+rectified data] [calibration] [tracklets]`


## Transform Kitti to XVIZ format

E.g date=2011_09_26 drive=0005

Unzip these archives and put them in `./kitty/data` directory

```
cd <path-to-jskitti-root-dir>
node --max-old-space-size=4096 kitti/transform.js --root=./data --date=2011_09_26 --drive=0005 --outdir=./prototype-xviz/data --disable-streams=lidar-points,vehicle-pose-trajectory
```


## Available Streams in KITTY data sets

```
  vehicle-pose,
  velocity,
  acceleration,
  lidar-points,
  tracklets,
  vehicle-pose-trajectory,
  tracklets-trajectory
```

### Structure of KITTY data

```
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
