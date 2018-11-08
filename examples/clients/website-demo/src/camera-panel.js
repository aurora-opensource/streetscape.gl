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

import React, {PureComponent} from 'react';
import {XvizPanel} from 'streetscape.gl';
import {FloatPanel} from 'monochrome-ui';

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: 400,
      y: 50,
      width: 400,
      height: 121,
      minimized: false
    }
  };

  _onUpdate = panelState => {
    this.setState({panelState});
  };

  render() {
    const {log} = this.props;
    const {panelState} = this.state;

    return (
      <FloatPanel
        {...panelState}
        title="Camera"
        className="camera-panel"
        movable={true}
        minimizable={true}
        resizable={true}
        onUpdate={this._onUpdate}
      >
        <XvizPanel log={log} id="Camera" />
      </FloatPanel>
    );
  }
}
