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

export default class XVIZContainer extends PureComponent {
  static propTypes = {
    layout: PropTypes.string
  };

  static defaultProps = {
    layout: 'VERTICAL'
  };

  render() {
    const {layout} = this.props;

    const layoutStyle = {
      display: 'flex',
      width: '100%'
    };
    const childStyle = {};

    // Normalize enums to uppercase
    switch (layout.toUpperCase()) {
      case 'VERTICAL':
        layoutStyle.flexDirection = 'column';
        childStyle.flex = '0 0 auto';
        break;

      case 'HORIZONTAL':
        layoutStyle.flexDirection = 'row';
        childStyle.flex = '1 1 auto';
        break;

      default:
        // Unknown layout type
        return null;
    }

    return (
      <div className="xviz-container" style={layoutStyle}>
        {React.Children.map(this.props.children, child => (
          <div style={childStyle}>{child}</div>
        ))}
      </div>
    );
  }
}
