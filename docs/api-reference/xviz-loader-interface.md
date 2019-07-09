# XVIZLoaderInterface

An interface that handles the loading and synchronization of a log. This is the base class of
[XVIZStreamLoader](/docs/api-reference/xviz-stream-loader.md),
[XVIZLiveLoader](/docs/api-reference/xviz-live-loader.md), and
[XVIZFileLoader](/docs/api-reference/xviz-file-loader.md).

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

Set the look ahead offset in seconds. This is used to retrieve a slice from the
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

Returns the current look ahead offset in seconds.

##### getMetadata()

Returns the loaded metadata.

##### getStreamMetadata()

Returns a map from stream names to stream metadata.

##### getStreamSettings()

Returns the current stream settings.

##### getStreams()

Returns all loaded streams.

##### getBufferedTimeRanges()

Returns the loaded time ranges of the buffer, as an array of `[start, end]` timestamps.

##### getLogStartTime()

Returns the start timestamp of the log.

##### getLogEndTime()

Returns the end timestamp of the log.

##### getBufferStartTime()

Returns the start timestamp of the requested buffer.

##### getBufferEndTime()

Returns the end timestamp of the requested buffer.

##### getCurrentFrame()

Returns the log
[frame](https://github.com/uber/xviz/blob/master/docs/api-reference/stream-synchronizer.md#getCurrentFrame-streamFilter-)
at the current timestamp.

## Implement A Custom Loader (experimental)

> Warning: this section is experimental and may change between minor versions. Refer to the
> CHANGELOG if you encounter any issues.

```js
import {_XVIZLoaderInterface as XVIZLoaderInterface} from 'streetscape.gl';
import {XVIZStreamBuffer, StreamSynchronizer} from '@xviz/parser';

function getMetadata(options) {
  // returns promise that resolves to metadata
}

function getTimeslices(options, callback) {
  // invokes callback when each timeslice is loaded
  // returns promise that resolves when done
}

class MyLoader extends XVIZLoaderInterface {
  connect() {
    const streamBuffer = new XVIZStreamBuffer();
    this.streamBuffer = streamBuffer;

    getMetadata(this.options)
      .then(metadata => {
        this._onXVIZMessage(metadata);
      })
      .then(() =>
        getTimeslices(this.options, timeslice => {
          this._onXVIZMessage(timeslice);
        })
      )
      .then(() => this.emit('done'))
      .catch(error => this.emit('error', error));
  }

  close() {}
}
```

### Required Methods

The following methods must be implemented in a custom loader.

##### connect()

Called to start loading data.

##### close()

Called to stop loading data.

### Private Members

##### options

The options object passed into the constructor.

##### streamBuffer

An instance of XVIZ's
[XVIZStreamBuffer](https://github.com/uber/xviz/blob/master/docs/api-reference/xviz-stream-buffer.md).
Must be supplied by the subclass.

### Private Methods

The following methods are utilities for subclasses.

##### set(key, value)

Save a key-value pair into the current loader state. Calling `set` will trigger an update in all
React components that subscribe to this loader.

##### get(key)

Retrieve a saved value from the current state.

##### emit(eventType, eventArgs)

Fire an event with the specified arguments.

##### onXVIZMessage(message)

Handler for a parsed XVIZ message, returned by
[parseStreamMessage](https://github.com/uber/xviz/blob/master/docs/api-reference/parse-xviz.md).

##### onError(message)

Handler for errors.
