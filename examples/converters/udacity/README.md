# Playground
A playground for exploring Udacity dataset


## Download dataset

https://github.com/udacity/self-driving-car/tree/master/datasets


## Parse rosbag to json frame by frame

Put the `*.bag` file in `../../../data/udacity` directory

```
yarn start -b HMB_5.bag
```

Generated data will be in `../../../data/generated/udacity` directory


## Topics

All the topics:

```
  '/can_bus_dbw/can_rx',
  '/vehicle/dbw_enabled',
  '/imu/data',
  '/fix',
  '/ecef/',
  '/time_reference',
  '/vehicle/throttle_report',
  '/vehicle/twist_controller/parameter_descriptions',
  '/vehicle/twist_controller/parameter_updates',
  '/vehicle/brake_info_report',
  '/pressure',
  '/vehicle/throttle_info_report',
  '/vehicle/imu/data_raw',
  '/vehicle/suspension_report',
  '/vehicle/wheel_speed_report',
  '/vehicle/joint_states',
  '/vehicle/steering_report',
  '/vehicle/filtered_accel',
  '/vehicle/brake_report',
  '/vehicle/gear_report',
  '/velodyne_packets',
  '/vehicle/misc_1_report',
  '/vehicle/sonar_cloud',
  '/vehicle/surround_report',
  '/vehicle/fuel_level_report',
  '/vehicle/gps/fix',
  '/vehicle/gps/time',
  '/vehicle/gps/vel',
  '/vehicle/tire_pressure_report',
  '/diagnostics',
  '/diagnostics',
  '/diagnostics',
  '/center_camera/camera_info',
  '/center_camera/image_color/compressed',
  '/right_camera/camera_info',
  '/right_camera/image_color/compressed',
  '/left_camera/camera_info',
  '/left_camera/image_color/compressed'
```

## Data sample

check `sample-data.json` under root directory. It contains the following topics.
```
  '/imu/data',
  '/vehicle/gps/fix',
  '/vehicle/gps/time',
  '/vehicle/gps/vel',
  '/vehicle/imu/data_raw'
```

Also `/velodyne_packets` is point cloud data which I didn't inlcude in the sample data.

If you are interested in other topics, modify `selectedTopics` in `src/transform.js` file.

