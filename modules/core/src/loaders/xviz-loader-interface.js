import {getXvizSettings} from '@xviz/parser';
import {clamp} from 'math.gl';

import createSelector from '../utils/create-selector';

/* eslint-disable callback-return */
export default class XVIZLoaderInterface {
  constructor(options = {}) {
    this.options = options;
    this._debug = options.debug || (() => {});
    this.callbacks = {};

    this.listeners = [];
    this.state = {};
    this._version = 0;
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

  subscribe(instance) {
    this.listeners.push(instance);
  }

  unsubscribe(instance) {
    const index = this.listeners.findIndex(o => o === instance);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this._version++;
      this.listeners.forEach(o => o(this._version));
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
    const metadata = this.getMetadata();

    if (metadata) {
      const startTime = this.getLogStartTime();
      const endTime = this.getLogEndTime();
      timestamp = clamp(timestamp, startTime, endTime);
    }

    this.set('timestamp', timestamp);
  }

  close() {
    throw new Error('not implemented');
  }

  /* Data selector API */

  getCurrentTime = () => this.get('timestamp');

  getMetadata = () => this.get('metadata');

  getLogSynchronizer = () => this.get('logSynchronizer');

  getStreams = () => this.get('streams');

  getLogStartTime = createSelector(this, this.getMetadata, metadata => {
    return metadata && metadata.start_time + getXvizSettings().TIME_WINDOW;
  });

  getLogEndTime = createSelector(this, this.getMetadata, metadata => {
    return metadata && metadata.end_time;
  });

  getBufferRange() {
    throw new Error('not implemented');
  }

  getCurrentFrame = createSelector(
    this,
    [this.getLogSynchronizer, this.getMetadata, this.getCurrentTime, this.getStreams],
    (logSynchronizer, metadata, timestamp, streams) => {
      if (logSynchronizer && metadata && Number.isFinite(timestamp)) {
        logSynchronizer.setTime(timestamp);
        return logSynchronizer.getCurrentFrame(metadata.streams);
      }
      return null;
    }
  );

  /* Private actions */
  _setMetadata(metadata) {
    this.set('metadata', metadata);
    const timestamp = this.get('timestamp');
    const newTimestamp = Number.isFinite(timestamp) ? timestamp : metadata.start_time;
    this.seek(newTimestamp);
  }
}
