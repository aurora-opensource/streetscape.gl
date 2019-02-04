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
import {FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton} from 'react-share';

import {media} from '../styles';
import MapboxLogo from './mapbox-logo';
import {UBER_LOGO, VIS_LOGO} from '../contents/content';

const Container = styled.div`
  background: #242730;
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.margins.large};

  ${media.palm`
    flex-direction: column;
    justify-content: center;
  `};
`;

const SectionContainer = styled.div`
  display: inline-flex;
  align-items: center;

  .SocialMediaShareButton {
    margin-left: 5px;
    outline: none;
    cursor: pointer;
  }

  ${media.palm`
    display: flex;
    justify-content: center;
    margin-top: ${props => props.theme.margins.small};
  `};
`;

const SectionText = styled.div`
  display: inline-flex;
  margin-left: 20px;
  align-items: center;
  color: ${props => props.theme.footerColor};
  font-size: 11px;
  justify-content: center;
  letter-spacing: 0.5px;
  line-height: 14px;
  z-index: 101;
`;

const StyledLogo = styled.div`
  display: inline-flex;
  margin-left: 0.8rem;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 4px;
  position: relative;
  margin-top: 0;
  margin-bottom: 0;

  a {
    color: #e5e5e4;
    letter-spacing: 2px;
  }
`;

const VisGLLogo = styled(StyledLogo)`
  margin-left: 1.8rem;
  :before {
    content: '';
    background: url(${props => props.logo}) no-repeat;
    background-size: cover;
    height: 20px;
    width: 24px;
    position: absolute;
    top: -5px;
    left: -25px;
  }
`;

const GithubButton = styled.a`
  width: 32px;
  height: 32px;
  font-size: 14px;
  line-height: 32px;
  text-align: center;
  background: #fff;
  color: #000 !important;
`;

export default class Footer extends PureComponent {
  render() {
    return (
      <Container>
        <SectionContainer>
          <a target="_blank" rel="noopener noreferrer" href="https://www.uber.com">
            <img src={UBER_LOGO} height={16} />
          </a>
          <SectionText>created by</SectionText>
          <VisGLLogo logo={VIS_LOGO}>
            <a target="_blank" rel="noopener noreferrer" href="http://vis.gl">
              VIS.GL
            </a>
          </VisGLLogo>
        </SectionContainer>

        <SectionContainer>
          <SectionText>partnership with</SectionText>
          <div
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <StyledLogo>
              <a target="_blank" rel="noopener noreferrer" href="https://voyage.auto/">
                Voyage Auto
              </a>
            </StyledLogo>
            <MapboxLogo target="_blank" rel="noopener noreferrer" href="https://mapbox.com/" />
          </div>
        </SectionContainer>

        <SectionContainer>
          <GithubButton href="https://github.com/uber/streetscape.gl">
            <span className={'icon-github'} />
          </GithubButton>
          <FacebookShareButton url="https://avs.auto">
            <FacebookIcon size={32} />
          </FacebookShareButton>{' '}
          <TwitterShareButton url="https://avs.auto" hashtags={['AVS']}>
            <TwitterIcon size={32} />
          </TwitterShareButton>
        </SectionContainer>
      </Container>
    );
  }
}
