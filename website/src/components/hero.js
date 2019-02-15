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
import styled, {keyframes} from 'styled-components';
import {window} from 'global';

import {media} from '../styles';
import {HERO_BACKGROUND, DEMO_VIDEO, DEMO_LINK} from '../contents/content';
import {LinkButton} from './common/styled-components';
import Video from './common/video';

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
  color: white;
  background: ${props => props.theme.darkBackgroundColor};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: ${props => props.theme.margins.huge};
`;

const Content = styled.div`
  box-sizing: 'border-box';
  padding: ${props => props.theme.margins.huge};
  width: 100vw;
  height: ${props => `${(1 - Math.sin(props.scrollTop * Math.PI) / 2) * 100}vh`};

  ${media.palm`
    height: ${props => `${(0.9 - Math.sin(props.scrollTop * Math.PI) / 5) * 100}vh`};
  `};
`;

const BackgroundImage = styled.div`
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100vw;
  height: 100vh;
  opacity: 0.15;
  background-image: url('${HERO_BACKGROUND}');
  background-position: center;
  background-size: cover;
`;

const StyledCaption = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

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
    scrollTop: 0
  };

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('resize', this.onScroll);
    this.onScroll();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
  }

  onScroll = () => {
    this.setState({
      scrollTop: Math.min(window.scrollY / window.innerHeight, 0.5)
    });
  };

  render() {
    return (
      <Container>
        <BackgroundImage />
        <Content scrollTop={this.state.scrollTop}>
          <StyledCaption>
            <div className="sg-home__caption__subtitle">
              Make a leap with your autonomous and robotics data.
            </div>
            <div className="sg-home__caption__description">
              <span>
                Autonomous Visualization System (AVS) is a fast, powerful, web-based 3D
                visualization toolkit for building applications from your autonomous and robotics
                data.
              </span>
            </div>
            <ButtonContainer>
              <LinkButton large href={DEMO_LINK}>
                Live demo
              </LinkButton>
              <LinkButton large outlineDark href="#/about" style={{marginLeft: '5px'}}>
                About AVS
              </LinkButton>
            </ButtonContainer>
          </StyledCaption>
        </Content>
        <FadeIn>
          <Video url={DEMO_VIDEO.url} poster={DEMO_VIDEO.poster} />
        </FadeIn>
      </Container>
    );
  }
}
