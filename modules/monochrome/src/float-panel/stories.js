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
import React, {Component} from 'react';
import {boolean} from '@storybook/addon-knobs';
import {storiesOf} from '@storybook/react';
import {withReadme} from 'storybook-readme';

import README from './README.md';
import FloatPanel from './index';
import {AutoSizer} from '../shared';

/**
 * Float Panel Example
 */
class FloatPanelExample extends Component {
  state = {
    x: 0,
    y: 0,
    size: 200,
    minimized: false
  };

  _onUpdatePanel = ({x, y, width, minimized}) => {
    width = Math.min(400, Math.max(50, width));

    this.setState({x, y, minimized, size: width});
  };

  render() {
    const {x, y, size, minimized} = this.state;

    return (
      <div style={{height: '100vh'}}>
        <AutoSizer>
          {({width, height}) => (
            <FloatPanel
              title={'My Photo'}
              parentWidth={width}
              parentHeight={height}
              x={x}
              y={y}
              width={size}
              height={size}
              minimized={minimized}
              movable={boolean('movable', true)}
              resizable={boolean('resizable', true)}
              minimizable={boolean('minimizable', true)}
              onUpdate={this._onUpdatePanel}
            >
              <img src="https://avatars2.githubusercontent.com/u/2059298?v=3&s=460" width="100%" />
            </FloatPanel>
          )}
        </AutoSizer>
      </div>
    );
  }
}

storiesOf('FloatPanel', module)
  .addDecorator(withReadme(README))
  .add('Basic example', () => <FloatPanelExample />);
