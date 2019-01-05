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

/* global window */
import React, {PureComponent} from 'react';
import {XVIZPanel} from 'streetscape.gl';
import {FloatPanel} from '@streetscape.gl/monochrome';

import {XVIZ_PANEL_STYLE, FLOAT_PANEL_STYLE} from './custom-styles';

const TITLE_HEIGHT = 28;

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: window.innerWidth - 420,
      y: 20,
      width: 400,
      height: 148,
      minimized: false
    }
  };

  componentWillReceiveProps(nextProps) {
    const {panelState} = this.state;
    if (this.props.videoAspectRatio !== nextProps.videoAspectRatio) {
      this.setState({
        panelState: {
          ...panelState,
          height: panelState.width / nextProps.videoAspectRatio + TITLE_HEIGHT
        }
      });
    }
  }

  _onUpdate = panelState => {
    const {videoAspectRatio} = this.props;
    this.setState({
      panelState: {
        ...panelState,
        height: panelState.width / videoAspectRatio + TITLE_HEIGHT
      }
    });
  };

  render() {
    const {log} = this.props;
    const {panelState} = this.state;

    return (
      <FloatPanel
        {...panelState}
        movable={true}
        minimizable={false}
        resizable={true}
        onUpdate={this._onUpdate}
        style={FLOAT_PANEL_STYLE}
      >
        <XVIZPanel log={log} name="Camera" style={XVIZ_PANEL_STYLE} />
      </FloatPanel>
    );
  }
}
