import assert from 'assert';
import {requestBinary, requestJson} from '../utils/request-utils';
import {
  parseStreamMessage,
  LOG_STREAM_MESSAGE,
  XvizStreamBuffer,
  parseBinaryXVIZ,
  StreamSynchronizer
} from '@xviz/client';

import XVIZLoaderInterface from './xviz-loader-interface';

const DEFAULT_LOG_PROFILE = 'default';

function getParams(options) {
  const {logGuid, logProfile = DEFAULT_LOG_PROFILE, fileFormat, timestamp, serverConfig} = options;

  // set duration overrides & defaults
  const duration = options.duration || serverConfig.defaultLogLength;

  assert(logGuid && duration);
  assert(fileFormat);

  return {
    fileFormat,
    dataPath: serverConfig.dataPath,
    logGuid,
    logProfile,
    duration,
    timestamp,
    serverConfig
  };
}

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.getFilePath);
    this._getFilePath = options.getFilePath;

    this.requestParams = getParams(options);
    this.streamBuffer = new XvizStreamBuffer();
    this.logSynchronizer = null;
    this.metadata = null;
  }

  isOpen() {
    return true;
  }

  connect() {
    // verify the dataPath exists?
    this._getFile();
  }

  close() {
    // what should do here?
  }

  getBufferRange() {
    return this.streamBuffer.getLoadedTimeRange();
  }

  seek(timestamp) {
    this.timestamp = timestamp;

    if (!timestamp) {
      return;
    }

    const {timestamp: currentTimestamp, duration: currentDuration} = this.requestParams;

    if (timestamp >= currentTimestamp && timestamp < currentTimestamp + currentDuration) {
      // within range
      return;
    }

    this.requestParams = getParams({
      ...this.requestParams,
      fileFormat: this.fileFormat,
      timestamp
    });

    this._getFile();
  }

  _getFile() {
    const params = this.requestParams;
    const {timestamp} = params;
    const filePath = this._getFilePath(timestamp);
    const fileFormat = this.fileFormat || 'binary';

    switch (fileFormat) {
      case 'binary':
        requestBinary(filePath).then(data => {
          parseStreamMessage({
            message: parseBinaryXVIZ(data),
            onResult: this._onMessage,
            onError: this._onError,
            worker: params.serverConfig.worker,
            maxConcurrency: params.serverConfig.maxConcurrency
          });
        });
        break;
      case 'json':
        requestJson(filePath).then(data =>
          parseStreamMessage({
            message: data,
            onResult: this._onMessage,
            onError: this._onError,
            worker: params.serverConfig.worker,
            maxConcurrency: params.serverConfig.maxConcurrency
          })
        );
        break;
      default:
    }
  }

  _onMessage = message => {
    switch (message.type) {
      case LOG_STREAM_MESSAGE.METADATA:
        this.logSynchronizer = new StreamSynchronizer(message.start_time, this.streamBuffer);
        this.metadata = message;
        this.emit('ready', message);
        break;

      case LOG_STREAM_MESSAGE.TIMESLICE:
        this.streamBuffer.insert(message);
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
