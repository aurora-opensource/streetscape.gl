# Convert Data to XVIZ

This section describes how to convert existing autonomy data into XVIZ format. It is intended to provide and understanding of the structure of XVIZ, its file format and how the `@xviz/builder` API can be used to easily generate conformant XVIZ.

It is worth spending some time in the [xviz](http://uber.github.com/xviz) Developer Guide to get some orientation about basic XVIZ concepts before continuing here.


## The KITTI DataSet

For this example we will be using the public KITTI dataset, representing short autonomous vehicle logs with lidar data, camera imagery and perception information. This is the data thaat is used in the streetscape.gl `converters/kitti` examples. Much of what is written in this article also can be gleaned by reading that source code, so feel encouraged to go back and forth.

Refer to the top-level README in streetscape.gl repo for information on how to download the KITTI data and run the example converter.


## Assumptions

Once downloaded and unzipped, the data set is divided into directories for different data types, and each type has one file per KITTI frame.

Following the recommended XVIZ approach, we want to generate one XVIZ GLB file per "frame" of data, which allows each frame to be conveniently served as a single binary socket message.

So we need to parse the individual KITTI files for each frame, parse and convert them to XVIZ, joining them all into a single binary XVIZ GLB file and write that to disk, and then repeat this propess for each KITTI frame. We also need to generate an XVIZ metadata frame with information about the various streams in our data frames.


## Converting


## The XVIZ Builder API

The XVIZ builder API provides a ["fluent" API](https://en.wikipedia.org/wiki/Fluent_interface) that lets you chain methods to add primitives to your XVIZ data in an easy-to-read way.

You'll need to "build" an XVIZ metadata file, and then build a file for each XVIZ "frame". XVIZ provides one "builder" class for each use case.



## Converting Camera Images

Images are typically stored in their own streams. They are then added to that stream, normally as its only content using the `.image` method, and can then optionally be resized using the `.dimensions` method.

```js
   xvizBuilder
      .stream(this.streamName)
      .image(nodeBufferToTypedArray(data), 'png')
      .dimensions(width, height);
```

You will also want to announce the image channel in your metadata:

```js
    const xb = xvizMetaBuilder;
    xb.stream(this.streamName)
      .category('primitive')
      .type('image');
```


> Due to storage size considerations, it is typically important to down scale images as much as possible. Many cameras today capture at HD resolutions and downsizing to e.g. 720x480 leads to a 4x size reduction, even without reducing quality.


## Converting Lidar Points

To ensure that they are efficently packed, point cloud positions should be stored as contiguous binary arrays (i.e. `Float32Array` in JavaScript).

First the points need to be loaded

```js
    const lidarData = loadLidarData(data);

    // This encode/parse is a temporary workaround until we get fine-grain
    // control of which streams should be packed in the binary.
    // By doing this we are able to have the points converted to the appropriate
    // TypedArray, and by unpacking them, they are in a JSON structure that
    // works better with the rest of the conversion.
    const temporaryObject = {vertices: lidarData.positions};

    xvizBuilder
      .stream(this.LIDAR_POINTS)
      .points(temporaryObject.vertices)
      .id(uuid())
      .color([0, 0, 0, 255]);
  }
```

You will also want to declare the channel, where you can add some styling and also a local coordinate system (in this case, the point cloud coordinates are relative to the lidar scanner, rather than the car, so we need to add information about the relative position of the lidar sensor).

```js
    xvizMetaBuilder
      .stream(this.LIDAR_POINTS)
      .category('primitive')
      .type('point')
      .styleClassDefault({
        fillColor: '#00a',
        radiusPixels: 2
      })
      // laser scanner relative to GPS position
      // http://www.cvlibs.net/datasets/kitti/setup.php
      .pose({
        x: 0.81,
        y: -0.32,
        z: 1.73
      });
```

## Converting Geometry Primitives

Geometry primitives are injected to the XVIZ stream through a variety of builder commands.

```js
    const tracklets = this.trackletFrames.get(i);
    tracklets.forEach(tracklet => {
      // Here you can see how the *classes* are used to tag the object
      // allowing for the *style* information to be shared across
      // categories of objects.
      xvizBuilder
        .stream(this.TRACKLETS)
        .polygon(tracklet.vertices)
        .classes([tracklet.objectType])
        .id(tracklet.id)

        .stream(this.TRACKLETS_TRACKING_POINT)
        .circle([tracklet.x, tracklet.y, tracklet.z])
        .id(tracklet.id)

        .stream(this.TRACKLETS_LABEL)
        // float above the object
        .position([tracklet.x, tracklet.y, tracklet.z + 2])
        .text(tracklet.id.slice(24));
    });
  }
```

```js
    xvizMetaBuilder;
      .stream(this.TRACKLETS)
      .category('primitive')
      .type('polygon')
      .styleClassDefault({
        extruded: true,
        wireframe: true,
        // TODO - use dynamic height
        height: 1.5,
        fillColor: '#00000080'
      })
      .styleClass('Car', {
        fillColor: '#7DDDD780',
        strokeColor: '#7DDDD7'
      })
      .styleClass('Cyclist', {
        fillColor: '#DA70BF80',
        strokeColor: '#DA70BF'
      })
      .styleClass('Pedestrian', {
        fillColor: '#FEC56480',
        strokeColor: '#FEC564'
      })
      .styleClass('Van', {
        fillColor: '#267E6380',
        strokeColor: '#267E63'
      })
      .styleClass('Unknown', {
        fillColor: '#D6A00080',
        strokeColor: '#D6A000'
      })
      .pose(this.FIXTURE_TRANSFORM_POSE)

      .stream(this.TRACKLETS_TRACKING_POINT)
      .category('primitive')
      .type('circle')
      .styleClassDefault({
        radius: 0.2,
        fillColor: '#FFFF00'
      })
      .pose(this.FIXTURE_TRANSFORM_POSE)

      .stream(this.TRACKLETS_LABEL)
      .category('primitive')
      .type('text')
      .styleClassDefault({
        size: 18,
        fillColor: '#0040E0'
      })
      .pose(this.FIXTURE_TRANSFORM_POSE)

      .stream(this.TRACKLETS_TRAJECTORY)
      .category('primitive')
      .type('polyline')
      .styleClassDefault({
        strokeColor: '#FEC557',
        strokeWidth: 0.3,
        strokeWidthMinPixels: 1
      })
      .pose(this.FIXTURE_TRANSFORM_POSE);
```

## Converting Values

Measured values can be stored in the data stream


## Adding Prediction Data

Many autonomous driving systems generate prediction and planning data in addition to perception data. Visualization of this data is often critical to allow deeper analysis. Unfortunately, the public KITTI data set does not come with prediction data, but for illustration purposes, we can synthesize some of that data since we have access to future frames.

```js
    for (let objectId = 0; objectId < this.data.objects.length; objectId++) {
      const object = this.data.objects[objectId];

      // object is in this frame
      if (i >= object.first_frame && i < object.last_frame) {
        const getTrackletsPrimitives = index => {
          const objects = this.trackletFrames.get(index);
          const tracklet = objects.find(x => x.id === object.properties.id);
          return tracklet;
        };

        const getTrajectory = traj => this._convertTrajectory(traj, i, this.getPose);
        const xvizTrajectory = generateTrajectoryFrame(
          i,
          Math.min(object.last_frame, this.frameLimit),
          getTrackletsPrimitives,
          getTrajectory
        );

        xvizBuilder.stream(this.TRACKLETS_TRAJECTORY).polyline(xvizTrajectory);
      }
    }
```

And of course we want to declare the channels in the metdata:

```js
    xvizMetaBuilder
      .stream('vehicle-pose')
      .category('vehicle-pose')

      .stream(this.VEHICLE_ACCELERATION)
      .category('time_series')
      .type('float')
      .unit('m/s^2')

      .stream(this.VEHICLE_VELOCITY)
      .category('time_series')
      .type('float')
      .unit('m/s')

      .stream(this.VEHICLE_TRAJECTORY)
      .category('primitive')
      .type('polyline')

      // This styling information is applied to *all* objects for this stream.
      // It is possible to apply inline styling on individual objects.
      .styleClassDefault({
        strokeColor: '#57AD57AA',
        strokeWidth: 1.4,
        strokeWidthMinPixels: 1
      });
```


## Pulling it all together

```js
    const xvizBuilder = new XVIZBuilder({
      metadata: this.metadata,
      disabledStreams: this.disabledStreams
    });

    const promises = this.converters.map(converter =>
      converter.convertFrame(frameNumber, xvizBuilder)
    );

    await Promise.all(promises);

    return xvizBuilder.getFrame();
```


## Serving and Visualizing the Data

Now that you have generated the `.glb` files for the XVIZ frames, you can start an XVIZ server to stream those frames over a WebSocket. Once the server is running you can run the streetscape.gl client, and start playing back and interacting in 3D with the newly converted KITTI log data.


## Validating XVIZ

As a final note, it may be interesting to validate the generated XVIZ data, especially if you build your XVIZ "manually" rather than through the XVIZ builder API. XVIZ provides JSON schemas that can me used to automate extensive correctness checks. For more information visit [xviz](http://uber.github.com/xviz).

