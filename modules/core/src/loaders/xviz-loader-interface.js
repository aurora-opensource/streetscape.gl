import {getXvizSettings} from '@xviz/parser';
import {clamp} from 'math.gl';

import {getTimeSeries} from '../utils/metrics-helper';
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

  getBufferRange() {
    throw new Error('not implemented');
  }

  getLogStartTime = createSelector(this, this.getMetadata, metadata => {
    return metadata && metadata.start_time + getXvizSettings().TIME_WINDOW;
  });

  getLogEndTime = createSelector(this, this.getMetadata, metadata => {
    return metadata && metadata.end_time;
  });

  getCurrentFrame = createSelector(
    this,
    [this.getLogSynchronizer, this.getMetadata, this.getCurrentTime, this.getStreams],
    // `getStreams` is only needed to trigger recomputation.
    // The logSynchronizer has access to the streamBuffer.
    (logSynchronizer, metadata, timestamp) => {
      if (logSynchronizer && metadata && Number.isFinite(timestamp)) {
        logSynchronizer.setTime(timestamp);
        return logSynchronizer.getCurrentFrame(metadata.streams);
      }
      return null;
    }
  );

  getTimeDomain = createSelector(
    this,
    [this.getLogStartTime, this.getLogEndTime],
    (logStartTime, logEndTime) => [logStartTime, logEndTime]
  );

  // TODO add declare ui metadata
  getTimeSeries = createSelector(this, [this.getMetadata, this.getStreams], (metadata, streams) =>
    getTimeSeries({metadata, streams})
  );

  getTimestamps = createSelector(this, this.getStreams, streams => {
    const vehiclePoses = streams && streams['/vehicle-pose'];
    if (vehiclePoses) {
      return vehiclePoses.map(pose => pose.timestamp || pose.time);
    }
    return null;
  });

  getImageStreamNames = createSelector(this, this.getMetadata, metadata => {
    const streams = metadata && metadata.streams;
    return (
      streams && Object.keys(streams).filter(streamName => streams[streamName].type === 'image')
    );
  });

  getImageFrames = createSelector(
    this,
    [this.getImageStreamNames, this.getStreams, this.getTimestamps],
    (imageStreamNames, streams, timestamps) => {
      if (streams && imageStreamNames) {
        const frames = {};
        imageStreamNames.forEach(streamName => {
          frames[streamName] = streams[streamName].map((frame, i) => {
            const timestamp = timestamps[i];
            if (frame && frame.images[0]) {
              // assign timestamp of vehicle pose to image frame
              Object.assign(frame.images[0], {timestamp});
            }
            return frame && frame.images[0];
          });
        });
        return frames;
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
