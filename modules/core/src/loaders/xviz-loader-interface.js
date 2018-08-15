import {getXvizSettings} from '@xviz/parser';
import {clamp} from 'math.gl';

/* eslint-disable callback-return */
export default class XVIZLoaderInterface {
  constructor(options = {}) {
    this.options = options;
    this._debug = options.debug || (() => {});
    this.callbacks = {};
    this.timestamp = null;
  }

  /* Event types:
   * - ready
   * - update
   * - finish
   * - error
   */
  on(eventType, cb) {
    this.callbacks[eventType] = this.callbacks[eventType] || [];
    this.callbacks[eventType].push(cb);
    return this;
  }

  off(eventType, cb) {
    const callbacks = this.callbacks[eventType];
    if (callbacks) {
      const index = callbacks.indexOf(cb);
      if (index >= 0) {
        callbacks.splice(index, 1);
      }
    }
    return this;
  }

  emit(eventType, eventArgs) {
    const callbacks = this.callbacks[eventType];
    if (callbacks) {
      for (const cb of callbacks) {
        cb(eventType, eventArgs);
      }
    }
  }

  /* Connection API */
  isOpen() {
    return false;
  }

  connect() {
    throw new Error('not implemented');
  }

  seek(timestamp) {
    this.timestamp = timestamp;
  }

  close() {
    throw new Error('not implemented');
  }

  /* Data selector API */
  getBufferRange() {
    throw new Error('not implemented');
  }

  getCurrentFrame() {
    const {logSynchronizer, metadata} = this;
    let {timestamp} = this;
    const timeWindow = getXvizSettings().TIME_WINDOW;

    if (logSynchronizer && metadata && timestamp) {
      timestamp = clamp(timestamp, metadata.start_time + timeWindow, metadata.end_time);
      logSynchronizer.setTime(timestamp);
      return logSynchronizer.getCurrentFrame(metadata.streams);
    }
    return null;
  }
}
