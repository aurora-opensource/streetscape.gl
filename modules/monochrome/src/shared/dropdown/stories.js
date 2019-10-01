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
import Dropdown from './index';

const SAMPLE_DATA = {
  cat: 'Cat',
  dog: 'Dog',
  banana: 'Banana'
};

class DropdownExample extends Component {
  state = {
    value: 'cat'
  };

  render() {
    return (
      <Dropdown
        data={SAMPLE_DATA}
        isEnabled={boolean('isEnabled', true)}
        value={this.state.value}
        onChange={value => this.setState({value})}
      />
    );
  }
}

storiesOf('Building Blocks', module)
  .addDecorator(withReadme(README))
  .add('Dropdown', () => <DropdownExample />);
