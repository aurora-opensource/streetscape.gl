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

import {Dropdown} from 'monochrome-ui';
import ImageSequence from './image-sequence';
import connectToLog from '../connect';

import {normalizeStreamFilter} from '../../utils/stream-utils';

class XvizVideoComponent extends PureComponent {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cameras: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
      PropTypes.func
    ])
  };

  static defaultProps = {
    width: '100%'
  };

  constructor(props) {
    super(props);

    this.state = {
      ...this._getStreamNames(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.imageFrames !== nextProps.imageFrames ||
      this.props.cameras !== nextProps.cameras
    ) {
      this.setState(this._getStreamNames(nextProps));
    }
  }

  _getStreamNames({imageFrames, cameras}) {
    if (!imageFrames) {
      return {
        streamNames: null,
        selectedStreamName: null
      };
    }

    const streamNames = Object.keys(imageFrames)
      .filter(normalizeStreamFilter(cameras))
      .sort();
    let {selectedStreamName} = this.state || {};
    if (!streamNames.includes(selectedStreamName)) {
      selectedStreamName = streamNames[0] || null;
    }
    return {selectedStreamName, streamNames};
  }

  _onSelectVideo = streamName => {
    this.setState({selectedStreamName: streamName});
  };

  _renderVideoSelector() {
    const {streamNames, selectedStreamName} = this.state;

    if (streamNames.length <= 1) {
      return null;
    }

    const data = {};
    streamNames.forEach(name => {
      // TODO - use display name from metadata
      data[name] = name;
    });

    return <Dropdown value={selectedStreamName} data={data} onChange={this._onSelectVideo} />;
  }

  render() {
    const {currentTime, imageFrames, width} = this.props;
    const {selectedStreamName} = this.state;

    if (!currentTime || !selectedStreamName) {
      return null;
    }

    return (
      <div>
        <ImageSequence
          width={width}
          src={imageFrames[selectedStreamName]}
          currentTime={currentTime}
        />

        {this._renderVideoSelector()}
      </div>
    );
  }
}

const getLogState = log => ({
  currentTime: log.getCurrentTime(),
  imageFrames: log.getImageFrames()
});

export default connectToLog({getLogState, Component: XvizVideoComponent});
