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
import {media} from '../styles';
import {LinkButton, CenteredContent} from './common/styled-components';
import Carousel from './common/carousel';

const CarouselContainer = styled.div`
  height: 360px;
  ${media.palm`
    height: 240px;
  `} ${media.desk`
    height: 480px;
  `};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.25);
  object-fit: cover;

  width: 420px;
  height: 320px;

  ${media.palm`
    width: 300px;
    height: 200px;
  `} ${media.desk`
    width: 560px;
    height: 420px;
  `};
`;

const NavContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
`;

const NavItems = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
`;

const NavItem = styled.div`
  width: 299px;
  margin: ${props => props.theme.margins.small};
  font-size: 10px;
  text-align: center;
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

const NavIcon = styled.span`
  display: block;
  font-size: ${props => (props.isActive ? 36 : 20)}px;
  color: ${props => (props.isActive ? '#000' : '#9BA0A5')};

  border-radius: ${props => (props.isActive ? 6 : 5)}px;
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-transform: 'uppercase';
  font-size: 20px;
  font-weight: 500;
`;

const Description = styled.div`
  color: #5b5f62;
`;

const Nav = ({items, selectedIndex, onClick}) => {
  const activeItem = items[selectedIndex];
  const {title, description, icon} = activeItem;

  return (
    <NavContainer>
      <NavItems>
        <NavItem isActive={true}>
          <Title>
            {title}
            <NavIcon isActive={true} key={`${icon}`} className={`icon-${icon}`} />
          </Title>
          <Description>{description}</Description>
        </NavItem>
      </NavItems>
    </NavContainer>
  );
};

class Elements extends PureComponent {
  state = {
    selectedIndex: 0
  };

  render() {
    const selectedIndex = this.state.selectedIndex;

    return (
      <div>
        <CarouselContainer>
          <Carousel
            selectedIndex={selectedIndex}
            onChange={i => this.setState({selectedIndex: i})}
            getTransform={({index, isVisible}) => {
              const xOffset = 45;
              const zOffset = 60;
              const yRotate = -25;
              const translateX = isVisible
                ? (index - ELEMENTS.length / 2 + (selectedIndex - ELEMENTS / 2 > 0 ? 1 : 0.5)) *
                  xOffset
                : 0;
              const translateZ = -Math.abs(index - selectedIndex) * zOffset;
              const rotateY = Math.sign(index - selectedIndex) * yRotate;
              return `
                perspective(600px)
                translate3d(${translateX}%, 0, ${translateZ}px)
                rotateY(${rotateY}deg)
                scale(${index === selectedIndex ? 1 : 0.8});
            `;
            }}
          >
            {ELEMENTS.map(({title, description, image, icon}, i) => (
              <Image key={`image-${i}`} src={image} />
            ))}
          </Carousel>
        </CarouselContainer>
        <Nav
          items={ELEMENTS}
          selectedIndex={this.state.selectedIndex}
          onClick={i => this.setState({selectedIndex: i})}
        />
        <CenteredContent>
          <LinkButton outline large href="https://github.com/uber/streetscape.gl">
            Read More
          </LinkButton>
        </CenteredContent>
      </div>
    );
  }
}

export default Elements;
