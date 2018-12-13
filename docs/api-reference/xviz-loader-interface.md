# XVIZLoaderInterface

An interface that handles the loading and synchronization of a log.

## Members

##### metadata

## Methods

##### connect()

Connect to the server and start loading data.

##### close()

Terminate all connections.

##### seek(timestamp)

Seek to a given timestamp.

##### updateStreamSettings(settings)

Update stream settings. The `settings` object is a stream name to value map and will be merged with
the existing settings.

##### on(eventType, callback)

Listen to an event.

**Event types**

- `ready` - fired when the log metadata is available
- `update` - fired when new data arrives
- `finish` - fired when all available data is loaded
- `error` - fired when an error is encountered

##### off(eventType, callback)

Stop listening to an event.

## Implementations

[XVIZStreamLoader](/docs/api-reference/xviz-stream-loader.md);
[XVIZFileLoader](/docs/api-reference/xviz-file-loader.md);
