/* global console, Buffer, setTimeout */
/* eslint-disable no-process-exit, no-console, camelcase */
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const process = require('process');

const {deltaTimeMs, extractZipFromFile} = require('./serve');
const {parseBinaryXVIZ} = require('@xviz/parser');

// TODO: auxillary timestamp tracking & images are not handled

const FRAME_DATA_SUFFIX = '-frame.glb';
const FRAME_DATA_JSON_SUFFIX = '-frame.json';

// Misc utils

function isJsonObject(data) {
  return data[0] === '{'.charCodeAt(0);
}

// return bytearray or undefined
function readFile(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);

    // If looks like JSON Object, convert to string
    if (isJsonObject(data)) {
      return data.toString();
    }

    // Binary data
    return data;
  }

  return undefined;
}

// return zero padded 3-digit number as string
function zeroPaddedPrefix(frame_index) {
  const zp = `000${frame_index.toString()}`;
  return zp.substr(-3);
}

// Frame Data Utillities

const START_INDEX = 1;

// Check for data files or tar.gz and extract as necessary
function setupFrameData(data_directory) {
  const frameNames = getFrameName(START_INDEX);

  const hasData = frameNames.some(name => {
    console.log('Checking for files: ', path.join(data_directory, name));
    return fs.existsSync(path.join(data_directory, name));
  });

  if (!hasData) {
    console.log('Checking for archive');
    const results = extractZipFromFile(path.join(data_directory, 'frames.tar.gz'));
    if (results.status !== 0) {
      console.log(`Uncompression of data failed.
        CODE: ${results.status}
        STDOUT: ${results.stdout}
        STDERR: ${results.STDERR}`);
    }
  }
}

// Support various formatted frame names
function getFrameName(index) {
  return [
    `${index}${FRAME_DATA_SUFFIX}`,
    `${zeroPaddedPrefix(index)}${FRAME_DATA_SUFFIX}`,
    `${index}${FRAME_DATA_JSON_SUFFIX}`,
    `${zeroPaddedPrefix(index)}${FRAME_DATA_JSON_SUFFIX}`
  ];
}

function getFrameMetadata(index, data_directory) {
  const frameName = getFrameName(index).find(filename => {
    const filepath = path.join(data_directory, filename);
    return fs.existsSync(filepath);
  });

  return (
    frameName && {
      path: path.join(data_directory, frameName)
    }
  );
}

// Return frame data from source
function getFrameData({path: filepath}) {
  // Find the first valid name
  return readFile(filepath);
}

// Read all frame data ('*-frame.glb' files) from the `data_directory`.
function loadFrames(data_directory) {
  const frames = [];

  // unzip archive if necessary
  setupFrameData(data_directory);

  for (let i = START_INDEX; i <= 99999; i++) {
    const metadata = getFrameMetadata(i, data_directory);
    if (metadata) {
      frames.push(metadata);
    } else {
      break;
    }
  }

  return frames;
}

function loadFrameTimings(frames) {
  let lastTime = 0;
  return frames.map(frame => {
    const data = getFrameData(frame);
    let jsonFrame = null;
    if (data instanceof Buffer) {
      jsonFrame = parseBinaryXVIZ(
        data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      );
    } else if (typeof data === 'string') {
      jsonFrame = JSON.parse(data);
    }

    const ts = getTimestamp(jsonFrame);
    if (Number.isFinite(ts)) {
      lastTime = ts;
    }

    return lastTime;
  });
}

// Determine the actual index into frames when looping over data repeatedly
// Happens when frame_limit > framesLength
function getFrameIndex(index, framesLength) {
  if (index >= framesLength) {
    // do not include count metadata
    const xviz_count = framesLength - 1;

    let real_index = index % xviz_count;
    if (real_index === 0) {
      real_index = xviz_count;
    }

    return real_index;
  }

  return index;
}

// Data Handling

// Return either the vehicle_pose timestamp, or max
// of timestamps in state_updates.
function getTimestamp(xviz_data) {
  const {start_time, vehicle_pose, state_updates} = xviz_data;

  let timestamp;
  if (start_time) {
    timestamp = start_time;
  } else if (vehicle_pose) {
    timestamp = vehicle_pose.time;
  } else if (state_updates) {
    timestamp = state_updates.reduce((t, stateUpdate) => {
      return Math.max(t, stateUpdate.timestamp);
    }, 0);
  }

  return timestamp;
}

// Connection State

class ConnectionContext {
  constructor(settings, frames, frameTiming) {
    this.frames = frames;
    this.frames_timing = frameTiming;
    this.settings = settings;
    this.t_start_time = null;

    this.onConnection.bind(this);
    this.onMessage.bind(this);
    this.sendFrame.bind(this);
  }

  onConnection(ws) {
    console.log('>  Connection from Client.');

    this.t_start_time = process.hrtime();
    this.ws = ws;

    // Respond to control messages from the browser
    ws.on('message', msg => this.onMessage(msg));
  }

  onMessage(message) {
    const msg = JSON.parse(message);

    console.log(`>  Message ${msg.type} from Client`);

    switch (msg.type) {
      case 'open_log': {
        console.log(`>> ts: ${msg.timestamp} duration: ${msg.duration}`);
        const frameRequest = this.setupFrameRequest(msg);
        if (frameRequest) {
          this.sendNextFrame(frameRequest);
        }
        break;
      }
      default:
        console.log('>  Unknown message', msg);
    }
  }

  /* Setup frameRequest to control subset of frames to send
   *
   * @returns frameRequest object or null
   */
  setupFrameRequest({timestamp, duration}) {
    const {frames, frames_timing} = this;
    const {frame_limit, duration: default_duration} = this.settings;

    //  log time bounds
    const log_time_start = frames_timing[1];
    const log_time_end = frames_timing[frames_timing.length - 1];

    // default values
    if (!timestamp) {
      timestamp = frames_timing[1];
    }

    if (!duration) {
      duration = default_duration;
    }

    // bounds checking
    const timestampStart = timestamp;
    const timestampEnd = timestamp + duration;

    if (timestampStart > log_time_end || timestampEnd < log_time_start) {
      return null;
    }

    let start = frames_timing.findIndex(ts => ts >= timestampStart);
    if (start === -1) {
      start = 1;
    }

    let end = frames_timing.findIndex(ts => ts >= timestampEnd);
    if (end === -1) {
      end = frames.length;
    }

    if (end > frame_limit) {
      end = frame_limit;
    }

    return {
      start,
      end,
      index: start
    };
  }

  // Setup interval for sending frame data
  sendNextFrame(frameRequest) {
    frameRequest.sendInterval = setTimeout(
      () => this.sendFrame(frameRequest),
      this.settings.send_interval
    );
  }

  // Send an individual frame of data
  sendFrame(frameRequest) {
    const ii = frameRequest.index;
    const last_index = frameRequest.end;

    const {skip_images} = this.settings;
    const frame_send_time = process.hrtime();
    const frames = this.frames;
    const frames_timing = this.frames_timing;

    // get frame info
    const frame_index = getFrameIndex(ii, frames.length);
    const frame = getFrameData(frames[frame_index]);

    // TODO images are not supported here, but glb data is
    // old image had a binary header
    const isBuffer = frame instanceof Buffer;
    const skipSending = isBuffer && skip_images;

    // End case
    if (ii >= last_index) {
      // When last_index reached send 'done' message
      this.ws.send(JSON.stringify({type: 'done'}), () => {
        this.logMsgSent(frame_send_time, -1, frame_index, 'json');
      });
      // this.ws.close();
      return;
    }

    // Advance frame
    frameRequest.index += 1;

    // NOTE: currently if we are skipping images we don't find the
    //       next non-image frame, we just let it cycle so sending can be
    //       delayed as a result. (ie. won't always send data at specified delay).
    //
    // Are we sending this frame?
    if (skipSending) {
      this.sendNextFrame(frameRequest);
    } else {
      const next_ts = frames_timing[frame_index];

      // Send data
      if (isBuffer) {
        this.ws.send(frame, () => {
          this.logMsgSent(frame_send_time, ii, frame_index, 'binary', next_ts);
          this.sendNextFrame(frameRequest);
        });
      } else {
        this.ws.send(frame, {compress: true}, () => {
          this.logMsgSent(frame_send_time, ii, frame_index, 'json', next_ts);
          this.sendNextFrame(frameRequest);
        });
      }
    }
  }

  logMsgSent(send_time, index, real_index, tag, ts = 0) {
    const t_from_start_ms = deltaTimeMs(this.t_start_time);
    const t_msg_send_time_ms = deltaTimeMs(send_time);
    console.log(
      ` < Frame(${tag}) ${index}:${real_index} ts:${ts} in self: ${t_msg_send_time_ms}ms start: ${t_from_start_ms}ms`
    );
  }
}

// Comms handling

function setupWebSocketHandling(wss, settings, frames, frameTiming) {
  // Setups initial connection state
  wss.on('connection', ws => {
    const context = new ConnectionContext(settings, frames, frameTiming);
    context.onConnection(ws);
  });
}

// Main

module.exports = function main(args) {
  console.log(`Loading frames from ${args.data_directory}`);
  const frames = loadFrames(args.data_directory);

  if (frames.length === 0) {
    console.error('No frames where loaded, exiting.');
    process.exit(1);
  }

  const frameTiming = loadFrameTimings(frames);
  console.log(`Loaded ${frames.length} frames`);

  const settings = {
    duration: args.duration,
    send_interval: args.delay,
    skip_images: args.skip_images,
    frame_limit: args.frame_limit || frames.length
  };

  const wss = new WebSocket.Server({port: args.port});
  setupWebSocketHandling(wss, settings, frames, frameTiming);
};
