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
/* eslint-disable camelcase */
import assert from 'assert';
import {XVIZStreamBuffer, parseStreamMessage} from '@xviz/parser';
import PromiseRetry from 'promise-retry';

import XVIZLoaderInterface from './xviz-loader-interface';
import XVIZController from './xviz-controller-v2';

/**
 * Connect to XVIZ 2 websocket manage storage of XVIZ data into a XVIZStreamBuffer
 *
 * This class is a Websocket base class and is expected to be subclassed with
 * the following methods overridden:
 *
 * - _onOpen()
 */
export default class XVIZWebsocketLoader extends XVIZLoaderInterface {
  /**
   * constructor
   * @params serverConfig {object}
   *   - serverConfig.serverUrl {string}
   *   - serverConfig.defaultLogLength {number, optional} - default 30
   *   - serverConfig.queryParams {object, optional}
   *   - serverConfig.retryAttempts {number, optional} - default 3
   * @params worker {string|function, optional}
   * @params maxConcurrency {number, optional} - default 3
   * @params debug {function} - Debug callback for the XVIZ parser.
   * @params logGuid {string}
   * @params logProfile {string, optional}
   * @params duration {number, optional}
   * @params timestamp {number, optional}
   * @params bufferLength {number, optional}
   */
  constructor(options = {}) {
    super(options);

    this.socket = null;

    this.retrySettings = {
      retries: 3,
      minTimeout: 500,
      randomize: true
    };

    this.streamBuffer = new XVIZStreamBuffer();

    // Handler object for the websocket events
    // Note: needs to be last due to member dependencies
    this.WebSocketClass = options.WebSocketClass || WebSocket;
  }

  isOpen() {
    return this.socket; // && this.socket.readyState === WEB_SOCKET_OPEN_STATE;
  }

  seek(timestamp) {
    super.seek(timestamp);
  }

  /**
   * Open an XVIZ socket connection with automatic retry
   *
   * @returns {Promise} WebSocket connection
   */
  connect() {
    assert(this.socket === null, 'Socket Manager still connected');

    this._debug('stream_start');
    const {url} = this.requestParams;

    // Wrap retry logic around connection
    return PromiseRetry(retry => {
      return new Promise((resolve, reject) => {
        try {
          const ws = new this.WebSocketClass(url);
          ws.binaryType = 'arraybuffer';

          ws.onmessage = message => {
            const hasMetadata = Boolean(this.getMetadata());

            return parseStreamMessage({
              message: message.data,
              onResult: this.onXVIZMessage,
              onError: this.onError,
              debug: this._debug.bind(this, 'parse_message'),
              worker: hasMetadata && this.options.worker,
              maxConcurrency: this.options.maxConcurrency
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

  // Subclasses *MUST* implement these methods
  _onOpen() {
    throw new Error('_onOpen() method must be overridden');
  }

  // PRIVATE Methods

  // Notifications and metric reporting
  _onWSOpen = () => {
    // Request data if we are restarting, otherwise wait for metadata
    // TODO - protocol negotiation
    this.xvizHandler = new XVIZController(this.socket);

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
