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
 * Tooltip is just a Popover with some style overrides
 */
import React from 'react';

import {evaluateStyle} from '../theme';

import Popover from './popover';

class Tooltip extends React.Component {
  static propTypes = Popover.propTypes;

  static defaultProps = {
    style: {},
    position: Popover.AUTO
  };

  render() {
    const {style} = this.props;
    const tooltipStyle = {
      ...style,
      body: props => ({
        maxWidth: 300,
        paddingTop: props.theme.spacingSmall,
        paddingBottom: props.theme.spacingSmall,
        paddingLeft: props.theme.spacingNormal,
        paddingRight: props.theme.spacingNormal,
        ...evaluateStyle(style.body, props)
      })
    };

    return <Popover {...this.props} style={tooltipStyle} trigger={Popover.HOVER} />;
  }
}

export default Tooltip;
