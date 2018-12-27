# XVIZLoaderInterface

An interface that handles the loading and synchronization of a log.

## Members

##### metadata

## Methods

### Actions

##### connect()

Connect to the server and start loading data.

##### close()

Terminate all connections.

##### on(eventType, callback)

Listen to an event.

**Event types**

- `ready` - fired when the log metadata is available
- `update` - fired when new data arrives
- `finish` - fired when all available data is loaded
- `error` - fired when an error is encountered

##### off(eventType, callback)

Stop listening to an event.

### Setters

##### seek(timestamp)

Seek to a given timestamp.

Parameters:

- `timestamp` (Number)

##### setLookAhead(lookAhead) {

Set the look ahead time. This is used to retrieve a slice from the
[future states](https://github.com/uber/xviz/blob/master/docs/protocol-schema/core-types.md#stream-set)
for display.

Parameters:

- `lookAhead` (Number) - in the same unit as the current timestamp.

##### updateStreamSettings(settings)

Update stream settings. The `settings` object is a stream name to value map and will be merged with
the existing settings.

Parameters:

- `settings` (Object) - a stream name to boolean map that indicates whether a stream should be
  included in the 3D scene.

### Getters

##### getCurrentTime()

Returns the current timestamp.

##### getLookAhead()

Returns the current look ahead offset.

##### getMetadata()

Returns the loaded metadata.

##### getStreamSettings()

Returns the current stream settings.

##### getStreams()

Returns all loaded streams.

##### getBufferRange()

Returns the loaded time ranges of the buffer, as an array of `[start, end]` timestamps.

##### getLogStartTime()

Returns the start timestamp of the log.

##### getLogEndTime()

Returns the end timestamp of the log.

##### getCurrentFrame()

Returns the log
[frame](https://github.com/uber/xviz/blob/master/docs/api-reference/xviz-synchronizer.md) at the
current timestamp.

##### getTimeDomain()

Returns `[start, end]` timestamps of the current log. Only includes a subset of the log if loading
into a limited buffer.

##### getTimeSeries()

Returns all
[time_series](https://github.com/uber/xviz/blob/master/docs/protocol-schema/core-types.md#stream-set)
streams.

##### getImageFrames()

Returns all
[image](https://github.com/uber/xviz/blob/master/docs/protocol-schema/geometry-primitives.md#image-primitive)
streams.

## Implementations

- [XVIZStreamLoader](/docs/api-reference/xviz-stream-loader.md)
- [XVIZFileLoader](/docs/api-reference/xviz-file-loader.md)
