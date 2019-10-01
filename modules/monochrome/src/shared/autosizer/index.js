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
/**
 * This component detects resize of divs using
 * react-virtualized's AutoSizer
 * with some enhancements
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import debounce from 'debounce';

const noop = () => null;

export default class SizeSensor extends Component {
  static propTypes = {
    debounceTime: PropTypes.number
  };

  _onResize = size => {
    if (this.resize) {
      this.resize(size);
    } else if (this.props.onResize) {
      const {onResize, debounceTime} = this.props;
      // invoke callback immediately the first time
      onResize(size);
      // set up debounce for subsequent resize events
      this.resize = debounceTime > 0 ? debounce(onResize, debounceTime) : onResize;
    }
  };

  render() {
    return <AutoSizer onResize={this._onResize}>{this.props.children || noop}</AutoSizer>;
  }
}
