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

import styled from '@emotion/styled';
import {Dropdown, withTheme, evaluateStyle} from '@streetscape.gl/monochrome';
import ImageSequence from './image-sequence';
import connectToLog from '../connect';

import {normalizeStreamFilter} from '../../utils/stream-utils';

const WrapperComponent = styled.span(props => ({
  ...props.theme.__reset__,
  position: 'relative',
  ...evaluateStyle(props.userStyle, props)
}));

class BaseComponent extends PureComponent {
  static propTypes = {
    // User configuration
    style: PropTypes.object,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    // From declarative UI video component
    cameras: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
      PropTypes.func
    ]),

    // From connected log
    currentTime: PropTypes.number,
    streamsMetadata: PropTypes.object,
    streams: PropTypes.object
  };

  static defaultProps = {
    style: {},
    width: '100%',
    height: 'auto'
  };

  constructor(props) {
    super(props);

    this.state = {
      ...this._getStreamNames(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.streamsMetadata !== nextProps.streamsMetadata ||
      this.props.cameras !== nextProps.cameras
    ) {
      this.setState(this._getStreamNames(nextProps));
    }
  }

  _getStreamNames({streamsMetadata, cameras}) {
    const streamNames = Object.keys(streamsMetadata)
      .filter(streamName => {
        const type = streamsMetadata[streamName] && streamsMetadata[streamName].primitive_type;
        return type === 'IMAGE' || type === 'image'; // Support pre-1.0 lowercase value
      })
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
    const {style} = this.props;
    const {streamNames, selectedStreamName} = this.state;

    if (streamNames.length <= 1) {
      return null;
    }

    const data = {};
    streamNames.forEach(name => {
      // TODO - use display name from metadata
      data[name] = name;
    });

    return (
      <Dropdown
        style={style.selector}
        value={selectedStreamName}
        data={data}
        onChange={this._onSelectVideo}
      />
    );
  }

  render() {
    const {currentTime, streams, width, height, style, theme} = this.props;
    const {selectedStreamName} = this.state;

    if (!streams || !currentTime || !selectedStreamName) {
      return null;
    }
    let images = streams[selectedStreamName];
    if (images) {
      images = images.filter(Boolean);
    }

    return (
      <WrapperComponent theme={theme} userStyle={style.wrapper}>
        <ImageSequence width={width} height={height} src={images} currentTime={currentTime} />

        {this._renderVideoSelector()}
      </WrapperComponent>
    );
  }
}

const getLogState = log => ({
  currentTime: log.getCurrentTime(),
  streamsMetadata: log.getStreamsMetadata(),
  streams: log.getStreams()
});

const XVIZVideoComponent = withTheme(BaseComponent);

export default connectToLog({getLogState, Component: XVIZVideoComponent});
