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

const {ArgumentParser} = require('argparse');
const path = require('path');

const parser = new ArgumentParser({
  addHelp: true,
  description: 'Example XVIZ stream server'
});

parser.addArgument(['-d', '--data_directory'], {
  required: true,
  help: 'Directory to serve data from. Relative path will be resolved relative to /data/generated/'
});

parser.addArgument(['--port'], {
  defaultValue: 8081,
  help: 'Websocket port to use'
});

parser.addArgument(['--frame_limit'], {
  help: 'Reduce or extend the number of frames to send'
});

parser.addArgument(['--delay'], {
  defaultValue: 50,
  help: 'Message send interval, 50ms as default'
});

parser.addArgument(['--skip_images'], {
  defaultValue: false,
  help: 'Will not send video frames'
});

module.exports = function getArgs() {
  const args = parser.parseArgs();
  args.data_directory = path.resolve(__dirname, '../../data/generated/', args.data_directory);
  return args;
};
