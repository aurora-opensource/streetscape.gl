# Convert Voyage ROS bag


## Initial setup
Install geographiclib:

### OSX
`brew install geographiclib`

### Ubuntu
`apt-get install libgeographic-dev`


```
yarn start --bag ./example.bag
```


## Available Streams

```
  vehicle-pose
  /vehicle/trajectory
  /lidar/points
  /tracklets/objects
```
