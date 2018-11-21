/* global fetch */
import assert from 'assert';
import {
  LOG_STREAM_MESSAGE,
  parseStreamMessage,
  StreamSynchronizer,
  XVIZStreamBuffer
} from '@xviz/parser';

import XVIZLoaderInterface from './xviz-loader-interface';

const DEFUALT_BATCH_SIZE = 4;

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.numberOfFrames && options.getFilePath);

    this._numberOfFrames = options.numberOfFrames;
    this._getFilePath = options.getFilePath;
    this._batchSize = options.maxConcurrency || DEFUALT_BATCH_SIZE;

    this.streamBuffer = new XVIZStreamBuffer();
    this._isOpen = false;
  }

  isOpen() {
    return this._isOpen;
  }

  connect() {
    this._isOpen = true;
    this._loadMetadata().then(() => this._loadNextBatch(1));
  }

  close() {
    // Stop file loading
    this._isOpen = false;
  }

  getBufferRange() {
    const range = this.streamBuffer.getLoadedTimeRange();
    if (range) {
      return [[range.start, range.end]];
    }
    return [];
  }

  seek(timestamp) {
    // TODO incomplete
    super.seek(timestamp);
  }

  _loadMetadata() {
    const metadataPath = this._getFilePath(0);
    assert(metadataPath);
    return this._loadFile(metadataPath, {worker: false});
  }

  _loadNextBatch(startFrame) {
    if (!this.isOpen()) {
      return;
    }

    if (startFrame >= this._numberOfFrames) {
      return;
    }

    const promises = [];
    for (let i = 0; i < this._batchSize && startFrame + i < this._numberOfFrames; i++) {
      const filePath = this._getFilePath(startFrame + i);
      assert(filePath);
      promises.push(this._loadFile(filePath, this.options));
    }

    // if there are more frames need to fetch
    Promise.all(promises.filter(Boolean)).then(() => {
      this._loadNextBatch(startFrame + this._batchSize);
    });
  }

  _loadFile(filePath, options) {
    const fileFormat = filePath.toLowerCase().match(/[^\.]*$/)[0];

    let file;
    switch (fileFormat) {
      case 'glb':
        file = fetch(filePath).then(resp => resp.arrayBuffer());
        break;

      case 'json':
        file = fetch(filePath).then(resp => resp.json());
        break;

      default:
        return Promise.reject('Unknown file format');
    }

    return file.then(data =>
      parseStreamMessage({
        message: data,
        onResult: this._onMessage,
        onError: this._onError,
        worker: options.worker,
        maxConcurrency: options.maxConcurrency
      })
    );
  }

  _onMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.set('logSynchronizer', new StreamSynchronizer(message.start_time, this.streamBuffer));
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

      case LOG_STREAM_MESSAGE.DONE:
        this.emit('finish', message);
        break;

      default:
        this.emit('error', message);
    }
  };

  _onError = error => {
    this.emit('error', error);
  };
}
