import assert from 'assert';
import {
  LOG_STREAM_MESSAGE,
  parseBinaryXVIZ,
  parseStreamMessage,
  StreamSynchronizer,
  XvizStreamBuffer
} from '@xviz/client';

import XVIZLoaderInterface from './xviz-loader-interface';
import {requestBinary, requestJson} from '../utils/request-utils';

const MAX_FILES = 9999;

function getParams(options) {
  const {timestamp, serverConfig} = options;

  return {
    timestamp,
    serverConfig
  };
}

export default class XVIZFileLoader extends XVIZLoaderInterface {
  constructor(options) {
    super(options);

    assert(options.getFileInfo);
    this._getFileInfo = options.getFileInfo;

    this.requestParams = getParams(options);
    this.streamBuffer = new XvizStreamBuffer();
    this.logSynchronizer = null;
    this.metadata = null;
    this._promises = [];
  }

  isOpen() {
    return true;
  }

  connect() {
    let sequence = 0;
    let fileInfo = this._getFileInfo(sequence);

    while (fileInfo && sequence < MAX_FILES) {
      // if there is more file to load
      this._loadFile(fileInfo);
      sequence++;
      fileInfo = this._getFileInfo(sequence);
    }
    this.close();
  }

  close() {
    // Stop file loading
  }

  getBufferRange() {
    return this.streamBuffer.getLoadedTimeRange();
  }

  seek(timestamp) {
    this.timestamp = timestamp;
  }

  _loadFile({filePath, fileFormat}) {
    const params = this.requestParams;

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
        this.emit('error', 'Invalid file format.');
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
