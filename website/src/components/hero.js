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
import styled, {keyframes} from 'styled-components';
import {window} from 'global';

import {media, breakPoints} from '../styles';
import {
  HERO_BACKGROUND,
  STREETSCAPE_GL_LOGO,
  HERO_IMAGES,
  HERO_IMAGES_SCALED,
  DEMO_LINK
} from '../contents/content';
import SlideShow from './common/slideshow';
import {LinkButton} from './common/styled-components';

const SlideShowAnimation = keyframes`
  0% {
    opacity: 0;
    transform: translate(0, 20px);
  }

  100% {
    opacity: 1.0
  }
`;

const FadeIn = styled.div`
  animation-name: ${SlideShowAnimation};
  animation-timing-function: ease-in-out;
  animation-duration: 1s;
  animation-delay: 500ms;
  animation-fill-mode: both;
`;

const Container = styled.div`
  padding: ${props => props.theme.margins.huge};
  color: white;
  background: ${props => props.theme.darkBackgroundColor};
  position: relative;

  ${media.palm`
    padding-top: ${props => props.theme.margins.large};
  `};
`;

const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${media.palm`
    margin-top: 3rem;
  `};
`;

const BackgroundImage = styled.img`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 70%;
  object-fit: scale-dowm;
  background: #0f1d29;
`;

const StyledCaption = styled.div`
  max-width: 600px;
  text-align: center;
  margin-bottom: 32px;
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  ${media.palm`
    width: auto;
    padding-top: 0;
    margin-right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0px;
  `} .sg-home__caption__subtitle {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 20px;
    line-height: 1.3;

    ${media.palm`
      font-size: 20px;
    `};
  }

  .sg-home__caption__description {
    font-size: 14px;
    color: ${props => props.theme.labelColor};
    line-height: 24px;
    margin-bottom: 32px;
    max-width: 532px;

    span.t-bold {
      color: ${props => props.theme.textColor};
      font-weight: 500;
    }

    ${media.palm`
      margin-bottom: 32px;
      text-align: center;
      font-size: 12px;
    `};
  }
`;

const Logo = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 120px;
  ${media.palm`
    position: inherit;
    margin-top: ${props => props.theme.margins.normal};
    margin-bottom: ${props => props.theme.margins.small};
  `};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;

  a {
    width: 160px;
  }

  ${media.palm`
    display: flex;
    justify-content: center;
    width: 100%;

    a {
      width: 50%;
    }
  `};
`;

export default class Hero extends PureComponent {
  state = {
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

  render() {
    const isPalm = this.state.width <= breakPoints.palm;
    return (
      <Container>
        <BackgroundImage src={HERO_BACKGROUND} />
        <Content>
          <Logo src={STREETSCAPE_GL_LOGO} />
          <StyledCaption>
            <div className="sg-home__caption__subtitle">
              Make an leap with your autonomous vehicle data
            </div>
            <div className="sg-home__caption__description">
              <span>streetscape.gl is a powerful </span>
              <span className="t-bold">open source </span>
              <span>web-based 3D visualization framework for </span>
              <span className="t-bold">full-stack </span>
              <span>autonomous development data sets.</span>
            </div>
            <ButtonContainer>
              <LinkButton large href={DEMO_LINK}>
                Try demo
              </LinkButton>
              <LinkButton large outlineDark href="#avs" style={{marginLeft: '5px'}}>
                About AVS
              </LinkButton>
            </ButtonContainer>
          </StyledCaption>
          <FadeIn>
            <SlideShow images={isPalm ? HERO_IMAGES_SCALED : HERO_IMAGES} />
          </FadeIn>
        </Content>
      </Container>
    );
  }
}
