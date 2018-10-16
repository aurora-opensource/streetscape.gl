import assert from 'assert';
import {json, buffer} from 'd3-fetch';
import {
  LOG_STREAM_MESSAGE,
  parseStreamMessage,
  StreamSynchronizer,
  XvizStreamBuffer
} from '@xviz/parser';

import XVIZLoaderInterface from './xviz-loader-interface';

const DEFUALT_BATCH_SIZE = 4;

function getParams(options) {
  const {timestamp, serverConfig} = options;

  assert(serverConfig.numberOfFrames && serverConfig.getFilePath);

  return {
    timestamp,
    numberOfFrames: serverConfig.numberOfFrames,
    getFilePath: serverConfig.getFilePath,
    batchSize: serverConfig.batchSize || DEFUALT_BATCH_SIZE,
    serverConfig
  };
}

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    this.requestParams = getParams(options);
    this.streamBuffer = new XvizStreamBuffer();
    this._isOpen = false;
  }

  isOpen() {
    return this._isOpen;
  }

  connect() {
    this._isOpen = true;
    this._loadNextBatch(0);
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

  _loadNextBatch(startFrame) {
    if (!this.isOpen()) {
      return;
    }

    const params = this.requestParams;
    if (startFrame >= params.numberOfFrames) {
      return;
    }

    const promises = [];
    for (let i = 0; i < params.batchSize && startFrame + i < params.numberOfFrames; i++) {
      const filePath = params.getFilePath(startFrame + i);
      assert(filePath);
      promises.push(this._loadFile(filePath));
    }

    // if there are more frames need to fetch
    Promise.all(promises.filter(Boolean)).then(() => {
      this._loadNextBatch(startFrame + params.batchSize);
    });
  }

  _loadFile(filePath) {
    const params = this.requestParams;
    const fileFormat = filePath.toLowerCase().match(/[^\.]*$/)[0];

    let fetch;
    switch (fileFormat) {
      case 'glb':
        fetch = buffer(filePath);
        break;

      case 'json':
        fetch = json(filePath);
        break;

      default:
        return Promise.reject('Unknown file format');
    }

    return fetch.then(data =>
      parseStreamMessage({
        message: data,
        onResult: this._onMessage,
        onError: this._onError,
        worker: params.serverConfig.worker,
        maxConcurrency: params.serverConfig.maxConcurrency
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
