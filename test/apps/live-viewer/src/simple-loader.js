// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global WebSocket,ArrayBuffer */
/* eslint-disable camelcase, complexity, no-unused-vars */
import {getXVIZConfig, parseStreamMessage} from '@xviz/parser';
import PromiseRetry from 'promise-retry';
import {_Pose as Pose} from 'math.gl';
import {addMetersToLngLat} from 'viewport-mercator-project';
import {_XVIZLoaderInterface} from '@streetscape.gl/core';

const EMPTY_VEHICLE_POSE = {
  longitude: 0,
  latitude: 0,
  x: 0,
  y: 0,
  z: 0
};

/*
 * - Handle filtering of streams
 * - Handle global XVIZObject registration
 * - SetLabelsOnXVIZObjects
 * - Selection of Lookahead based on lookahead Offset
 *
 *  shape:
 * trackedObjectId
 * vehiclePose
 * .. getTransformsFromPose(vehiclePose)
 * features
 * lookAheads
 * variables
 * pointCloud
 * components
 * streams
 * links
 *
 * objects
 */
class MyLogSlice {
  constructor(streamFilter, lookAheadMs, links, streams) {
    this.features = {};
    this.variables = {};
    this.pointCloud = null;
    this.lookAheads = {};
    this.components = {};
    this.links = {};
    this.streams = {};

    this._init(streamFilter, lookAheadMs, links, streams);
  }

  _includeStream(streamFilter, streamName) {
    return !streamFilter || streamFilter[streamName];
  }

  _init(streamFilter, lookAheadMs, links, streams) {
    const filter = streamFilter && Object.keys(streamFilter).length > 0 ? streamFilter : null;

    for (const streamName in streams) {
      if (
        this.streams[streamName] !== null && // Explicit no data entry
        !this.streams[streamName] && // undefined means it has not been seen so keep looking for valid entry
        streams[streamName] &&
        this._includeStream(filter, streamName)
      ) {
        const datum = streams[streamName];
        const {features = [], lookAheads = [], variable, pointCloud = null} = datum;
        this.streams[streamName] = datum;

        // this.lookAheads index based on lookAheadMs
        if (features.length) {
          this.features[streamName] = features;
        }

        if (variable !== undefined) {
          this.variables[streamName] = variable;
        }
      }
    }

    // get data if we don't already have that stream && it is not filtered.
    for (const streamName in links) {
      if (
        this.links[streamName] !== null && // Explicit no data entry
        !this.links[streamName] && // undefined means it has not been seen so keep looking for valid entry
        this._includeStream(filter, streamName)
      ) {
        this.links[streamName] = links[streamName];
      }
    }
  }
  // Helper function to get a stream from data
  // @param {Object} data - log data
  // @param {String} stream - name of stream
  // @param {*} defaultValue={} - return value in case stream is not present
  // @return {Object} - contents of stream or defaultValue
  getStream(stream, defaultValue = {}) {
    const streamData = this.streams[stream];
    if (!streamData) {
      return defaultValue;
    }
    return streamData;
  }

  getCurrentFrame(params, postProcessFrame) {
    const {vehiclePose} = params;
    if (!vehiclePose) {
      return null;
    }

    const frame = {
      ...params,
      ...getTransformsFromPose(vehiclePose),
      vehiclePose,
      features: this.features,
      lookAheads: this.lookAheads,
      variables: this.variables,
      pointCloud: this.pointCloud,
      components: this.components,
      streams: this.streams,
      links: this.links,
      objects: []
    };

    // NO postProcessFrame()
    // NO XVIZObject.resetAll()
    // NO updateObjects(...)
    // NO frame.objects

    return frame;
  }
}

class MockSynchronizer {
  constructor(streamState) {
    this.streamState = streamState;
  }

  setTime(ts) {
    // ignored as it has no effect in a LIVE session
  }

  setLookAheadTimeOffset(ts) {
    // TODO(twojtasz): still valid in a live session
  }

  // Get data for current time...
  // @return {Object} - keys are stream names
  //  values are the datum from each stream that best matches the current time.
  // The "frame" contains the processed and combined data from the current log slice
  getCurrentFrame(streamSettings, trackedObjectId) {
    if (Object.keys(this.streamState).length === 0) {
      return null;
    }

    // Note the args are not arrays
    const logSlice = new MyLogSlice(
      streamSettings,
      0.0,
      this.streamState.links,
      this.streamState.streams
    );
    if (!logSlice) {
      return null;
    }

    const {PRIMARY_POSE_STREAM, ALLOW_MISSING_PRIMARY_POSE} = getXVIZConfig();
    // If a missing primary pose stream is allowed, then set the default pose
    // value to origin.
    const defaultPose = ALLOW_MISSING_PRIMARY_POSE ? EMPTY_VEHICLE_POSE : null;
    const vehiclePose = logSlice.getStream(PRIMARY_POSE_STREAM, defaultPose);
    const postProcessFrame = null;

    const frame = logSlice.getCurrentFrame({vehiclePose, trackedObjectId}, postProcessFrame);
    return frame;
  }
}

/**
 * Connect to XVIZ websocket and manage storage of XVIZ data into a
 * single set of stream state for an LIVE session viewer.
 */
export class SimpleLoader extends _XVIZLoaderInterface {
  /**
   * constructor
   * @params serverConfig {object}
   *   - serverConfig.serverUrl {string}
   *   - serverConfig.queryParams {object, optional}
   *   - serverConfig.retryAttempts {number, optional} - default 3
   * @params debug {function} - Debug callback for the XVIZ parser.
   * @params logGuid {string}
   * @params logProfile {string, optional}
   * @params WebSocketClass {class, optional}
   */
  constructor(options = {}) {
    super(options);

    // Handler object for the websocket events
    // Note: needs to be last due to member dependencies
    this.WebSocketClass = options.WebSocketClass || WebSocket;
    this.socket = null;
    this.retrySettings = {
      retries: 3,
      minTimeout: 500,
      randomize: true
    };

    this.lastTimestamp = -1;

    // Only needs {url}
    this.requestParams = getSocketRequestParams(options);

    this.streamState = {};
    /*
    streamBuffer
      .timeslices []
      .persisteny []
      .streams {}
      .links {}
    */

    // This is only used by base class getCurrentFrame() method
    this.logSynchronizer = new MockSynchronizer(this.streamState);
  }

  isOpen() {
    return this.socket; // && this.socket.readyState === WEB_SOCKET_OPEN_STATE;
  }

  seek(timestamp) {
    // Override base class and just set the timestamp
    // to trigger a render update
    this.set('timestamp', timestamp);
  }

  /**
   * Open an XVIZ socket connection with automatic retry
   *
   * @returns {Promise} WebSocket connection
   */
  connect() {
    this._debug('stream_start');
    const {url} = this.requestParams;

    // Wrap retry logic around connection
    return PromiseRetry(retry => {
      return new Promise((resolve, reject) => {
        try {
          const ws = new this.WebSocketClass(url);
          ws.binaryType = 'arraybuffer';

          ws.onmessage = message => {
            return parseStreamMessage({
              message: message.data,
              onResult: this.onXVIZMessage,
              onError: this.onError,
              debug: this._debug.bind(this, 'parse_message'),
              worker: false
            });
          };

          ws.onerror = this.onError;
          ws.onclose = event => {
            this._onWSClose(event);
            reject(event);
          };

          // On success, resolve the promise with the now ready socket
          ws.onopen = () => {
            this.socket = ws;
            this._onWSOpen();
            resolve(ws);
          };
        } catch (err) {
          reject(err);
        }
      }).catch(event => {
        this._onWSError(event);
        const isAbnormalClosure = event.code > 1000 && event.code !== 1005;

        // Retry if abnormal or connection never established
        if (isAbnormalClosure || !this.socket) {
          retry();
        }
      });
    }, this.retrySettings).catch(this._onWSError);
  }

  close() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  // PRIVATE Methods
  _onOpen() {
    // A live session expects data to stream automatically
  }

  _onXVIZTimeslice(message) {
    // TODO: no_data_stream
    // message: {links, streams, timestamp, type, updateType }
    if (message.timestamp > this.lastTimestamp) {
      this.lastTimestamp = message.timestamp;

      // Merge message into current state
      this.streamState.streams = {...this.streamState.streams, ...message.streams};
      this.streamState.links = {...this.streamState.links, ...message.links};
      this.set('timestamp', message.timestamp);
      this._bumpDataVersion();
    }
  }

  _onXVIZMetadata(metadata) {
    // TODO(twojtasz): allow metadtata at any time and merge
    // results? We already have DYNAMIC_STREAM_METADATA
    //
    this.set('metadata', metadata);
    if (metadata.streams && Object.keys(metadata.streams).length > 0) {
      this.set('streamSettings', metadata.streams);
    }
  }

  _getDataByStream() {
    return this.streamState.streams;
  }

  // TODO(twojtasz): coupling between components and abstraction
  // I think this is valid in the abstraction because
  // even if not used in all implemenations.  We can
  // behave appropriately with or without this.
  //
  // Need to make the expectations explicit.
  _getBufferedTimeRanges() {
    return [];
  }

  _getBufferStartTime() {
    return undefined;
  }

  _getBufferEndTime() {
    return undefined;
  }

  // Notifications and metric reporting
  _onWSOpen = () => {
    this._debug('socket_open', this.requestParams);
    this._onOpen();
  };

  _onWSClose = event => {
    // Only called on connection closure, which would be an error case
    this._debug('socket_closed', event);
  };

  _onWSError = event => {
    this._debug('socket_error', event);
  };
}

function getSocketRequestParams(options) {
  const {
    logGuid,
    logProfile = 'default',
    serverConfig,
    WebSocketClass,
    ...passThroughOptions
  } = options;

  const queryParams = {
    ...passThroughOptions,
    ...serverConfig.queryParams,
    log: logGuid,
    profile: logProfile
  };

  const retryAttempts = Number.isInteger(serverConfig.retryAttempts)
    ? serverConfig.retryAttempts
    : 3;

  const qs = Object.keys(queryParams)
    .filter(key => key !== 'session_type')
    .map(key => `${key}=${queryParams[key]}`)
    .join('&');

  return {
    url: `${serverConfig.serverUrl}?session_type=live&${qs}`,
    logGuid,
    logProfile,
    retryAttempts,
    serverConfig
  };
}

function getTransformsFromPose(vehiclePose) {
  const {longitude, latitude, altitude = 0} = vehiclePose;

  const origin =
    Number.isFinite(vehiclePose.longitude) && Number.isFinite(vehiclePose.latitude)
      ? [longitude, latitude, altitude]
      : null;
  const pose = new Pose(vehiclePose);

  const vehicleRelativeTransform = pose.getTransformationMatrix();

  // If map_origin is not specified, use a faux position of [0, 0, 0]
  // deck.gl needs a lon/lat position to target the camera
  const trackPosition = addMetersToLngLat(
    origin || [0, 0, 0],
    vehicleRelativeTransform.transformVector([0, 0, 0])
  );

  return {
    origin,
    vehicleRelativeTransform,
    trackPosition,
    heading: (pose.yaw / Math.PI) * 180
  };
}
