### nuTonomy XVIZ Conversion Example

This nuTonomy data set is used to demonstrate how to convert data into the XVIZ format.

The structure of this examples places the core conversion objects in `src/converters`. 

The *converter* objects are responsible for calling the parsers and knowing the structure of the data
such that it can be processed by a *frame*, which is all the data required for a point in time.

In this example, the data has been synchronized for us, but XVIZ does support data sources operating at
different rates.

Follow the comments to get an understanding of the how's and why's of converting data to XVIZ.

### nuTonomy Data Set

* [nuTonomy dataset](https://www.nuscenes.org/download)**

* [python lib](https://github.com/nutonomy/nuscenes-devkit/tree/master/python-sdk)
* [Jupyter notebook](https://github.com/nutonomy/nuscenes-devkit/blob/master/python-sdk/tutorial.ipynb)


### Download nuTonomy Data

1. Go to **[nuTonomy dataset](https://www.nuscenes.org/download)**
2. Download `Meta data and annotations`, `LIDAR and RADAR pointclouds used as keyframes`, `Camera images used as keyframes`
3. Extract three archives and put them under directory `data` of root.

## Transform nuTonomy to XVIZ format

E.g load `scene-0006`

```
yarn start -d nuscenes_teaser_meta_v1/v0.1 --samples-directory=samples --scene=6 --image-max-width=300
```


### Structure of KITTI data

Detailed [schema](https://github.com/nutonomy/nuscenes-devkit/blob/master/schema.md)

```
|--data
    |--nutonomy
    |    |--nuscenes_teaser_meta_v1
    |    |    |--v0.1                           
    |    |    |    |--ego_pose.json              // vehicle pose             
    |    |    |    |--sample_data.json
    |    |    |    |--sample_annotation.json
    |    |    |    |--...
    |    |    |--maps                            // maps png files
    |    |
    |    |--samples                              // camera data, lidar and radar data
    |
    |--generated                                 // generated data dir
        |--nutonomy
            |--nuscenes_teaser_meta_v1
                |--v0.1
                    |--0-frame.glb               // per frame per json file
                    |--1-frame.glb
```
