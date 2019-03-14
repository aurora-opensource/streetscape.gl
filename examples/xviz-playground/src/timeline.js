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
import {connectToLog, PlaybackControl} from 'streetscape.gl';

const STYLE = {
  markers: {
    height: 20
  },
  lookAheadMarker: {
    marginTop: 12
  }
};

class Timeline extends PureComponent {
  _getMarkers() {
    const {timestamps} = this.props;
    return timestamps.map(t => ({
      time: t,
      content: <div className="frame-marker" onClick={() => this._onClickMarker(t)} />
    }));
  }

  _onClickMarker(t) {
    const {log, onLoadFrame} = this.props;
    log.seek(t);
    onLoadFrame(t);
  }

  _formatTimeStamp(t) {
    return t.toFixed(2);
  }

  render() {
    return (
      <div id="timeline">
        <PlaybackControl
          width="100%"
          style={STYLE}
          log={this.props.log}
          formatTimestamp={this._formatTimeStamp}
          markers={this._getMarkers()}
        />
      </div>
    );
  }
}

const getLogState = log => ({
  timestamps: log.getTimestamps()
});

export default connectToLog({getLogState, Component: Timeline});
