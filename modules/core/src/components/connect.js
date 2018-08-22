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

import XVIZLoaderInterface from '../loaders/xviz-loader-interface';

export default function connectToLog({getLogState, Component}) {
  class WrappedComponent extends PureComponent {
    static propTypes = {
      log: PropTypes.instanceOf(XVIZLoaderInterface).isRequired
    };

    state = {
      lastUpdate: 0
    };

    componentDidMount() {
      this.props.log.on('update', this._update);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.log !== nextProps.log) {
        this.props.log.off('update', this._update);
        nextProps.log.on('update', this._update);
      }
    }

    componentWillUnmount() {
      this.props.log.off('update', this._update);
    }

    _update = () => {
      this.setState({lastUpdate: Date.now()});
    };

    render() {
      const {log, ...otherProps} = this.props;

      const logState = getLogState(log);

      return <Component {...otherProps} {...logState} log={log} />;
    }
  }

  return WrappedComponent;
}
