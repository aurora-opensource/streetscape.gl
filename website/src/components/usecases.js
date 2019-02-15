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
import styled from 'styled-components';

import {SLIDESHOW_IMAGES} from '../contents/content';
import Swipeable from './common/swipeable';

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: 1.2em;
  text-align: center;
`;

const ItemImage = styled.img`
  box-shadow: 0 12px 24px 0 rgba(0, 0, 0, 0.5);
  margin: ${props => props.theme.margins.huge};
  margin-top: 0;
  width: 80vw;
  max-width: 800px;
`;

class Usecases extends PureComponent {
  state = {
    selectedIndex: 0
  };

  _onSelectionChange = selectedIndex => {
    this.setState({selectedIndex});
  };

  render() {
    return (
      <Swipeable onChange={this._onSelectionChange} selectedIndex={this.state.selectedIndex}>
        <ItemContainer>
          <ItemImage src={SLIDESHOW_IMAGES[0]} />
          <p>
            Support widespread knowledge sharing through scalable, simple and appealing{' '}
            <b>log viewing</b>
          </p>
        </ItemContainer>
        <ItemContainer>
          <ItemImage src={SLIDESHOW_IMAGES[1]} />
          <p>
            Enable smarter & faster autonomous software iteration by timely and in-depth{' '}
            <b>triaging</b>
          </p>
        </ItemContainer>
        <ItemContainer>
          <ItemImage src={SLIDESHOW_IMAGES[2]} />
          <p>
            Improve <b>simulation</b> workflow by visualizing and comparing results quickly
          </p>
        </ItemContainer>
      </Swipeable>
    );
  }
}

export default Usecases;
