/* global console */
/* eslint-disable no-process-exit, no-console */
const fs = require('fs');
const minimist = require('minimist');
const WebSocket = require('ws');
const path = require('path');
const process = require('process');

const {delta_time_ms, extract_zip_from_file} = require('./serve');

const DEFAULT_DATA_DIRECTORY = path.resolve(
  process.cwd(),
  '../../data/generated/kitty/2011_09_26_drive_0005_sync'
);

// TODO: auxillary timestamp tracking & images are not handled

const programArguments = minimist(process.argv.slice(2), {
  boolean: ['skip_images'],
  default: {
    port: 8081,
    frame_limit: undefined,
    data_directory: DEFAULT_DATA_DIRECTORY,
    delay: 50,
    skip_images: false
  }
});

const FRAME_DATA_SUFFIX = '-frame.json';

function help() {
  console.log(`
XVIZ service serving data from a local directory.
Options:
 --help                Help message
 --port #              Websocket port to use
 --frame_limit #       reduce or extend the number of frames to send
 --data_directory dir  Directory to serve data from, CWD as default
 --delay #ms           Message send interval, 50ms as default
 --skip_images         Will not send video frames

 Example:
    node xviz-serve-data.js --data_directory local-data/teleassist-still  --skip_images=false --frame_limit 8000
`);
}

// Misc utils

function isJsonObject(data) {
  return data[0] === '{'.charCodeAt(0);
}

function isString(data) {
  return typeof data === 'string';
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

  const hasData = frameNames.some(name => fs.existsSync(path.join(data_directory, name)));
  if (!hasData) {
    console.log('Checking for archive');
    const results = extract_zip_from_file(path.join(data_directory, 'frames.tar.gz'));
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
  return [`${index}${FRAME_DATA_SUFFIX}`, `${zeroPaddedPrefix(index)}${FRAME_DATA_SUFFIX}`];
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
function getFrameData({path}) {
  // Find the first valid name
  return readFile(path);
}

// Read all frame data ('*-frame.json' files) from the `data_directory`.
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

// Determine the actual index into frames when looping over data repeatedly
// Happens when frame_limit > framesLength
function getFrameIndex(index, framesLength) {
  if (index >= framesLength) {
    // do not include count metadata
    const xviz_count = framesLength - 1;

    var real_index = index % xviz_count;
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
  const {vehicle_pose, state_updates} = xviz_data;

  let timestamp;
  if (vehicle_pose) {
    timestamp = vehicle_pose.time;
  } else if (state_updates) {
    timestamp = state_updates.reduce((t, stateUpdate) => {
      return Math.max(t, stateUpdate.timestamp);
    }, 0);
  }

  return timestamp;
}

// TODO: auxillary timestamp tracking.
// Right now you have to restart the server after a session with frame_limit
// > frames.length, because I mutate what should be immutable. Need to fix this.
//
function updateTimestamp(xviz_data, ts) {
  const {vehicle_pose, state_updates} = xviz_data;

  if (vehicle_pose) {
    vehicle_pose.time = ts;
  } else if (state_updates && state_updates.length > 0) {
    // Since AV Web Platform uses the max of any timestamp, we just set the first one
    state_updates[0].timestamp = ts;
  }
}

// Connection State

const FRAME_TRACKING_DEFAULTS = {
  timestamp: 0,
  i: 0,
  sendInterval: 0
};

class ConnectionContext {
  constructor(settings, frames) {
    this.frames = frames;
    this.settings = settings;
    this.t_start_time = null;

    // Per connection settings
    this.frame_tracking = {...FRAME_TRACKING_DEFAULTS};

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
        this.sendNextFrame();
        break;
      }
      default:
        console.log('>  Unknown message', msg);
    }
  }

  // Setup interval for sending frame data
  sendNextFrame() {
    this.frame_tracking.sendInterval = setTimeout(
      () => this.sendFrame(),
      this.settings.send_interval
    );
  }

  // Send an individual frame of data
  sendFrame() {
    const ii = this.frame_tracking.i;
    const {frame_limit, skip_images, send_interval} = this.settings;

    // End case
    if (ii >= frame_limit) {
      // When frame_limit reached send 'done' message
      this.ws.send(JSON.stringify({type: 'done'}), () => {
        this.logMsgSent(frame_send_time, this.frame_tracking.i, frame_index, 'json');
      });
      this.ws.close();
      return;
    }

    const frames = this.frames;
    // get frame info
    const frame_send_time = process.hrtime();
    const frame_index = getFrameIndex(ii, frames.length);
    const frame = getFrameData(frames[frame_index]);
    const isBuffer = frame instanceof Buffer;
    const skipSending = isBuffer && skip_images;

    // NOTE: currently if we are skipping images we don't find the
    //       next non-image frame, we just let it cycle so sending can be
    //       delayed as a result. (ie. won't always send data at specified delay).
    //
    // Are we sending this frame?
    if (skipSending) {
      this.sendNextFrame();
    } else {
      // Determine next timestamp, used if looping beyond actual frames
      let next_ts = getTimestamp(frame);

      if (ii > frames.length && next_ts < this.frame_tracking.timestamp) {
        // timestamp increment is based on delay, even if sending at
        // that rate is not accurate, could be different but fine for now.
        next_ts = this.frame_tracking.timestamp + send_interval / 1000;
        updateTimestamp(frame, this.frame_tracking.timestamp);
      }

      this.frame_tracking.timestamp = next_ts;

      // Send data
      if (isBuffer) {
        this.ws.send(frame, () => {
          this.logMsgSent(frame_send_time, ii, frame_index, 'img');
          this.sendNextFrame();
        });
      } else {
        this.ws.send(frame, {compress: true}, () => {
          this.logMsgSent(frame_send_time, ii, frame_index, 'json');
          this.sendNextFrame();
        });
      }
    }

    this.frame_tracking.i++;
  }

  logMsgSent(send_time, index, real_index, tag) {
    const t_from_start_ms = delta_time_ms(this.t_start_time);
    const t_msg_send_time_ms = delta_time_ms(send_time);
    console.log(
      ` < Frame(${tag}) ${index}:${real_index} in self: ${t_msg_send_time_ms}ms start: ${t_from_start_ms}ms`
    );
  }
}

// Comms handling

function setupWebSocketHandling(wss, settings, frames) {
  // Setups initial connection state
  wss.on('connection', ws => {
    const context = new ConnectionContext(settings, frames);
    context.onConnection(ws);
  });
}

// Main

function main(args) {
  if (args.help) {
    help();
    process.exit(0);
  }

  console.log(`Loading frames from ${path.join(args.data_directory, `*${FRAME_DATA_SUFFIX}`)}`);
  const frames = loadFrames(args.data_directory);

  if (frames.length === 0) {
    console.error('No frames where loaded, exiting.');
    process.exit(1);
  }
  console.log(`Loaded ${frames.length} frames`);

  const settings = {
    send_interval: args.delay,
    skip_images: args.skip_images,
    frame_limit: args.frame_limit || frames.length
  };

  const wss = new WebSocket.Server({port: args.port});
  setupWebSocketHandling(wss, settings, frames);
}

main(programArguments);
