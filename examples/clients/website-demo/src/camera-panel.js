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
import {XVIZPanel} from 'streetscape.gl';
import {FloatPanel} from '@streetscape.gl/monochrome';

import {PANEL_STYLE} from './custom-styles';

const ASPECT_RATIO = 10 / 3;

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: 800,
      y: 50,
      width: 400,
      height: 120,
      minimized: false
    }
  };

  _onUpdate = panelState => {
    this.setState({panelState: {...panelState, width: panelState.height * ASPECT_RATIO}});
  };

  render() {
    const {log} = this.props;
    const {panelState} = this.state;

    return (
      <FloatPanel
        {...panelState}
        title="Camera"
        movable={true}
        minimizable={false}
        resizable={true}
        onUpdate={this._onUpdate}
      >
        <XVIZPanel log={log} name="Camera" style={PANEL_STYLE} />
      </FloatPanel>
    );
  }
}
