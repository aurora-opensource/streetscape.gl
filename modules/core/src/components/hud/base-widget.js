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
import {evaluateStyle, withTheme} from '@streetscape.gl/monochrome';
import styled from '@emotion/styled';

import connectToLog from '../connect';
import {getTimeSeriesStreamEntry} from '../../utils/stream-utils';

const WrapperComponent = styled.div(props => ({
  ...props.theme.__reset__,
  padding: props.theme.spacingSmall,
  display: 'inline-block',
  ...evaluateStyle(props.userStyle, props)
}));

class BaseWidget extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    streamNames: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,

    // From connected log
    streamsMetadata: PropTypes.object,
    frame: PropTypes.object
  };

  static defaultProps = {
    style: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      streams: this._extractStreams(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.streamNames !== this.props.streamNames ||
      nextProps.streamsMetadata !== this.props.streamsMetadata ||
      nextProps.frame !== this.props.frame
    ) {
      this.setState({streams: this._extractStreams(nextProps)});
    }
  }

  _extractStreams({streamNames, streamsMetadata, frame}) {
    const result = {};
    for (const key in streamNames) {
      const streamName = streamNames[key];
      if (streamName) {
        result[key] = {
          ...streamsMetadata[streamName],
          data: frame && getTimeSeriesStreamEntry(frame.streams[streamName])
        };
      }
    }
    return result;
  }

  render() {
    const {theme, style, children} = this.props;
    const {streams} = this.state;

    return (
      <WrapperComponent theme={theme} userStyle={style.wrapper}>
        {children({theme, streams})}
      </WrapperComponent>
    );
  }
}

const getLogState = log => ({
  streamsMetadata: log.getStreamsMetadata(),
  frame: log.getCurrentFrame()
});

export default connectToLog({getLogState, Component: withTheme(BaseWidget)});
