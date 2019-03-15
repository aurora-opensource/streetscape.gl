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
import {StreamSettingsPanel} from 'streetscape.gl';

export const STREAM_SETTINGS_STYLE = {
  checkbox: {
    wrapper: props => ({
      width: '100%',
      position: 'relative',
      opacity: props.value === 'off' ? 0.4 : 1
    }),
    border: props => ({
      borderStyle: 'none',
      marginRight: 8
    }),
    iconOn: 'check_box',
    iconOff: 'check_box_outline_blank',
    iconIndeterminate: 'indeterminate_check_box',
    icon: props => ({
      fontFamily: 'Material Icons',
      fontSize: 18,
      color: props.value === 'on' ? '#08c' : '#888'
    })
  },
  badge: props => ({
    position: 'absolute',
    right: 0,
    background: '#aaa',
    color: '#fff',
    padding: '0 8px',
    borderRadius: 8,
    '&:before': {content: `"${props.type || ''}"`}
  })
};

export default class StreamSettings extends PureComponent {
  render() {
    return (
      <div className="panel" id="streams">
        <StreamSettingsPanel log={this.props.log} style={STREAM_SETTINGS_STYLE} />
      </div>
    );
  }
}
