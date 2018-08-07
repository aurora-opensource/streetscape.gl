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
import PropTypes from 'prop-types';

import {clamp} from 'math.gl';
import {getXvizSettings} from '@xviz/client';

import Core3DViewer from './core-3d-viewer';
import VIEW_MODES from '../constants/view-modes';

export default class LogPlayer extends PureComponent {
  static propTypes = {
    log: PropTypes.object,
    metadata: PropTypes.object,
    timestamp: PropTypes.number
  };

  render() {
    const {log, metadata, mapStyle, xvizStyle, car, viewMode = VIEW_MODES.PERSPECTIVE} = this.props;
    const timeWindow = getXvizSettings().TIME_WINDOW;

    if (!log || !metadata) {
      return null;
    }

    const timestamp = clamp(
      this.props.timestamp,
      metadata.start_time + timeWindow,
      metadata.end_time
    );
    log.setTime(timestamp);
    const frame = log.getCurrentFrame(metadata.streams);

    return (
      <Core3DViewer
        frame={frame}
        mapStyle={mapStyle}
        xvizStyle={xvizStyle}
        car={car}
        viewMode={viewMode}
      />
    );
  }
}
