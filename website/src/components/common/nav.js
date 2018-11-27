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

import {media} from '../../styles';

const NavContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
  ${media.palm`
    margin-top: 12px;
  `};
`;

const NavItems = styled.div`
  display: flex;
  justify-content: center;
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.margins.small};
  font-size: 10px;
  text-align: center;
  filter: ${props => props.isActive && 'brightness(300%)'};
  transform: ${props => props.isActive && 'scale(1.1)'};
  transition: transform 500ms, filter 500ms;
  cursor: pointer;
  :hover {
    transform: scale(1.1);
  }

  ${media.palm`
    margin: 2px 4px;
    font-size: 8px;
  `};
`;

const Text = styled.span`
  margin-bottom: 24px;
  ${media.palm`
    margin-bottom: 12px;
  `};
`;

const NavIcon = styled.div`
  display: block;

  width: ${props => (props.isActive ? 12 : 10)}px;
  height: ${props => (props.isActive ? 12 : 10)}px;

  border-radius: ${props => (props.isActive ? 6 : 5)}px;
  background-color: ${props => (props.isActive ? '#FFFFFF' : '#9BA0A5')};
`;

export default class Nav extends PureComponent {
  render() {
    const {items, selectedIndex, onClick} = this.props;
    const text = items[selectedIndex].text;
    return (
      <NavContainer>
        {text && <Text>{text}</Text>}
        <NavItems>
          {items.map((_, i) => {
            const isActive = selectedIndex === i;
            return (
              <NavItem key={i} isActive={isActive} onClick={() => onClick(i)}>
                <NavIcon isActive={isActive} />
              </NavItem>
            );
          })}
        </NavItems>
      </NavContainer>
    );
  }
}
