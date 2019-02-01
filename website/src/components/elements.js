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

import {ELEMENTS} from '../contents/content';
import {LinkButton, CenteredContent} from './common/styled-components';

const ElementsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 900px;
  margin: 32px auto;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 240px;
  margin: 12px;
`;

const ItemIcon = styled.div`
  font-size: 96px;
`;

const ItemTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 500;
`;

const ItemDescription = styled.div`
  color: #5b5f62;
`;

class Elements extends PureComponent {
  _renderItem({title, description, icon}) {
    return (
      <ItemContainer key={title}>
        <ItemIcon className={`icon-${icon}`} />
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContainer>
    );
  }

  render() {
    return (
      <div>
        <ElementsContainer>{ELEMENTS.map(this._renderItem)}</ElementsContainer>

        <CenteredContent>
          <LinkButton outline large href="#/xviz/getting-started/converting-to-xviz/overview">
            Get Started
          </LinkButton>
        </CenteredContent>
      </div>
    );
  }
}

export default Elements;
