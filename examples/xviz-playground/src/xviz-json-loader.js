import {
  LOG_STREAM_MESSAGE,
  parseStreamMessage,
  StreamSynchronizer,
  XVIZStreamBuffer
} from '@xviz/parser';

import {_XVIZLoaderInterface as XVIZLoaderInterface} from 'streetscape.gl';

export default class XVIZJsonLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);
    this.streamBuffer = new XVIZStreamBuffer();
  }

  getBufferRange() {
    const range = this.streamBuffer.getLoadedTimeRange();
    if (range) {
      return [[range.start, range.end]];
    }
    return [];
  }

  push(message) {
    console.log(message); // eslint-disable-line

    parseStreamMessage({
      message,
      onResult: this._onMessage,
      onError: this._onError
    });
  }

  _onMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.set('logSynchronizer', new StreamSynchronizer(this.streamBuffer));
        this._setMetadata(message);
        this.emit('ready', message);
        break;

      case LOG_STREAM_MESSAGE.TIMESLICE:
        const oldVersion = this.streamBuffer.valueOf();
        this.streamBuffer.insert(message);
        if (this.streamBuffer.valueOf() !== oldVersion) {
          this.set('streams', this.streamBuffer.getStreams());
        }
        this.emit('update', message);
        break;

      default:
        this.emit('error', message);
    }
  };

  _onError = error => {
    this.emit('error', error);
  };
}
