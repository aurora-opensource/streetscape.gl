// Copyright (c) 2018 Uber Technologies, Inc.
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
import {window} from 'global';

import {breakPoints, media} from '../styles';
import {ELEMENTS} from '../contents/content';
import {LinkButton, CenteredContent} from './common/styled-components';
import Carousal from './common/carousel';

const ImageContainer = styled.div`
  height: 360px;
  overflow: hidden;
  ${media.palm`
    height: 240px;
  `} ${media.desk`
    height: 480px;
  `};
`;

const TitleContainer = styled.div`
  height: 80px;
  ${media.palm`
    height: 60px;
  `} ${media.desk`
    height: 100px;
  `};
`;

const DescriptionContainer = styled.div`
  height: 80px;
  ${media.palm`
    height: 60px;
  `} ${media.desk`
    height: 120px;
  `};
  margin-bottom: ${props => props.theme.margins.small};
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

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${props => (props.isActive ? '#000' : '#9BA0A5')};

  width: 420px;
  ${media.palm`
    width: 320px;
  `} ${media.desk`
    width: 560px;
  `};
`;

const Title = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: 20px;
  font-weight: 500;
`;

const Description = styled.div`
  color: #5b5f62;
  width: 240px;
`;

const NavIcon = styled.span`
  display: block;
  font-size: ${props => (props.isActive ? 36 : 20)}px;

  border-radius: ${props => (props.isActive ? 6 : 5)}px;
`;

class Elements extends PureComponent {
  state = {
    selectedIndex: 0,
    window: window.innerWidth,
    height: window.innerHeight
  };

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  _getImageTransform = ({isVisible, index}) => {
    const isPalm = this.state.width <= breakPoints.palm;
    const selectedIndex = this.state.selectedIndex;
    const xOffset = 45;
    const zOffset = 60;
    const yRotate = -25;
    const translateX = isVisible
      ? isPalm
        ? (index - selectedIndex) * xOffset
        : // A hack to make the images layout aligned with design
          (index - ELEMENTS.length / 2 + (selectedIndex - ELEMENTS / 2 > 0 ? 1 : 0.5)) * xOffset
      : 0;
    const translateZ = -Math.abs(index - selectedIndex) * zOffset;
    const rotateY = Math.sign(index - selectedIndex) * yRotate;
    return `
      perspective(600px)
      translate3d(${translateX}%, 0, ${translateZ}px)
      rotateY(${rotateY}deg)
      scale(${index === selectedIndex ? 1 : 0.8});
    `;
  };

  _getTransform = ({isVisible, index}) => {
    const isPalm = this.state.width <= breakPoints.palm;
    const selectedIndex = this.state.selectedIndex;
    const xOffset = 45;
    const zOffset = 60;
    const translateX = isVisible
      ? isPalm
        ? (index - selectedIndex) * xOffset
        : // A hack to make the images layout aligned with design
          (index - ELEMENTS.length / 2 + (selectedIndex - ELEMENTS / 2 > 0 ? 1 : 0.5)) * xOffset
      : 0;
    const translateZ = -Math.abs(index - selectedIndex) * zOffset;
    return `
      translate3d(${translateX}%, 0, ${translateZ}px)
      scale(${index === selectedIndex ? 1 : 0.8});
    `;
  };

  render() {
    const selectedIndex = this.state.selectedIndex;

    return (
      <div>
        <TitleContainer>
          <Carousal
            minHeight="80px"
            selectedIndex={selectedIndex}
            onChange={i => this.setState({selectedIndex: i})}
            getTransform={this._getTransform}
          >
            {ELEMENTS.map(({title, description, image, icon}, i) => {
              const isActive = i === selectedIndex;
              return (
                <Column isActive={isActive}>
                  <Title>
                    {title}
                    <NavIcon isActive={isActive} key={`${icon}`} className={`icon-${icon}`} />
                  </Title>
                </Column>
              );
            })}
          </Carousal>
        </TitleContainer>
        <ImageContainer>
          <Carousal
            minHeight="420px"
            selectedIndex={selectedIndex}
            onChange={i => this.setState({selectedIndex: i})}
            getTransform={this._getImageTransform}
          >
            {ELEMENTS.map(({title, description, image, icon}, i) => (
              <Image key={`image-${i}`} src={image} />
            ))}
          </Carousal>
        </ImageContainer>
        <DescriptionContainer>
          <Carousal
            selectedIndex={selectedIndex}
            onChange={i => this.setState({selectedIndex: i})}
            getTransform={this._getTransform}
          >
            {ELEMENTS.map(({title, description, image, icon}, i) => {
              const isActive = i === selectedIndex;
              return (
                <Column isActive={isActive}>
                  {isActive && <Description>{description}</Description>}
                </Column>
              );
            })}
          </Carousal>
        </DescriptionContainer>

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
