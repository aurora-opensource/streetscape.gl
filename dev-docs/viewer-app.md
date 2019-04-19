# Developer Viewer Application

This application has additional features beyond the
[get-started](https://github.com/uber/streetscape.gl/tree/master/docs/get-started/starter-kit.md)
that are detailed here. Instructions and features in the get-started application will work with the
viewer application.

The viewer application is intented to work with the _@xviz/server_ module and exposes the full
capabilities of the XVIZ protocol and server.

# Developer Features

Below is the list of features and application details the viewer application has beyond the
get-started example.

## URL path support

The _@xviz/server_ supports using the `path` component of the URL to access arbitrary XVIZ data
sources rather than hosting a single XVIZ data source.

For example, if there is a directory `xviz-data` that had the following sub-folders:

```
~/xviz-data/
  |
  +-- xviz-sample-1/
  |
  +-- xviz-sample-2/
  |
  +-- ros-example.bag
```

And the _@xviz/server_ is started with the following arguments:

```
xviz/modules/server$ ./bin/xvizserver --d ~/xviz-data
```

The various XVIZ data sources can be accessed with the following URL's respectively.

 - http://localhost:8080/xviz-sample-1
 - http://localhost:8080/xviz-sample-2
 - http://localhost:8080/ros-example

## Query Parameters

| Parameter        | Description                                                                           | Default                 |
| ---------------- | ------------------------------------------------------------------------------------- | ----------------------- |
| **server**       | Override XVIZ server URL                                                              | ws://localhost:3000     |
| **log**          | A field send upon initial connection with the XVIZ server                             | default                 |
| **worker**       | Boolean to control if workers are enabled, useful to debug XVIZ parsing               | true                    |
| **profile**      | A field send upon initial connection with the XVIZ Server                             | null                    |
| **timestamp**    | A field sent upon initial connection interpreted as the starting time to stream       | null                    |
| **duration**     | Specifies the duration of the XVIZ data to stream                                     | 30 seconds              |
| **bufferLength** | In **live** log mode, this controls how much of the data is kept in front-end buffers | Default is _30_ seconds |

Example: `http://localhost:8080?server=ws://remote-dev-xviz:3000&log=test-log-name`
