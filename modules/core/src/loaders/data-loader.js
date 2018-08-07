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

/* global WebSocket,console */
/* eslint-disable no-console */
import {
  parseStreamMessage,
  LOG_STREAM_MESSAGE,
  parseBinaryXVIZ,
  XvizStreamBuffer,
  StreamSynchronizer
} from '@xviz/client';

const noop = () => {};

// Return closure that handles parsing XVIZ stream messages
function onLogStreamMessage({onMessage, onError, serverConfig, debug}) {
  return message => {
    // Server is sending a control msg {type: "done"} which should not be parsed
    if (message.data instanceof ArrayBuffer) {
      const unpacked = parseBinaryXVIZ(message.data);
      // console.log(unpacked);
      return parseStreamMessage({
        message: unpacked,
        onResult: onMessage,
        onError,
        debug,
        worker: serverConfig.worker,
        maxConcurrency: serverConfig.maxConcurrency
      });
    }
    return null;
  };
}

function streamLog({
  binaryType,
  serverConfig,
  CreateSocket = WebSocket,
  onError = noop,
  onMessage = noop,
  onClose = noop,
  onOpen = noop
}) {
  // TODO/ib - so far not much success detecting socket connection failure (usually VPN)
  // Code should be removed unless we can make it work
  // http://stackoverflow.com/questions/25779831/how-to-catch-websocket-connection-to-ws-xxxnn-failed-connection-closed-be
  return new Promise((resolve, reject) => {
    try {
      const ws = new CreateSocket(serverConfig.serverUrl);

      if (binaryType) {
        ws.binaryType = binaryType;
      }

      ws.onmessage = onLogStreamMessage({onMessage, onError, serverConfig});
      ws.onerror = onError;
      ws.onclose = event => {
        onClose(event);
        reject(event);
      };

      // On success, resolve the promise with the now ready socket
      ws.onopen = () => {
        onOpen();
        ws.send(JSON.stringify({type: 'open_log', during: 30}));
        resolve(ws);
      };
    } catch (err) {
      reject(err);
    }
  });
}

export function openLogStream({serverConfig, onMetadata, onUpdate}) {
  const streamBuffer = new XvizStreamBuffer();
  let logSynchronizer = null;

  return streamLog({
    logGuid: 'mock',
    binaryType: 'arraybuffer',
    serverConfig,
    onOpen: () => console.log('Connected to xviz stream server'),
    onMessage: msg => {
      switch (msg.type) {
        case LOG_STREAM_MESSAGE.METADATA:
          logSynchronizer = new StreamSynchronizer(msg.start_time, streamBuffer);
          return onMetadata(msg);

        case LOG_STREAM_MESSAGE.TIMESLICE:
          streamBuffer.insert(msg);
          return onUpdate(logSynchronizer);

        default:
          return console.warn(msg);
      }
    },
    onError: console.error
  });
}
