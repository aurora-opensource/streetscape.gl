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
import {XVIZStreamLoader} from 'streetscape.gl';

export default class XVIZStreamDebugLoader extends XVIZStreamLoader {
  constructor(options) {
    super(options);

    const onWSMessage = this._onWSMessage;
    this._onWSMessage = message => {
      this.emit('websocket_message', message);
      onWSMessage(message);
    };
  }

  _onXVIZTimeslice(message) {
    super._onXVIZTimeslice(message);
    // Navigate to the latest timestamp to simulate live-playback
    this.seek(message.timestamp);
    // Trigger synchronization
    this.getCurrentFrame();
  }
}
