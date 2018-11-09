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

import {LinkButton} from './common/styled-components';
import {media} from '../styles';
import MapboxLogo from './mapbox-logo';
import {UBER_LOGO, VIS_LOGO} from '../content';

const Container = styled.div`
  background: #242730;
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.margins.medium};
`;

const LogosContainer = styled.div`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;

  ${media.palm`
    flex-direction: column;
  `};
`;

const BrandingContainer = styled.div`
  display: inline-flex;
  align-items: center;
  ${media.palm`
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

const ButtonContainer = styled.div`
  display: flex;
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

const SocialContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .SocialMediaShareButton {
    margin-right: 5px;
  }

  ${media.palm`
    display: flex;
    justify-content: center;
    margin-top: 12px;
    width: 100%;
  `};
`;

export default class Footer extends PureComponent {
  render() {
    return (
      <Container>
        <ButtonContainer>
          <LinkButton large href="https://github.com/uber/streetscape.gl">
            Get Started
          </LinkButton>
        </ButtonContainer>

        <SocialContainer>
          <FacebookShareButton url="https://uber.github.io/streetscape.gl/">
            <FacebookIcon size={32} />
          </FacebookShareButton>{' '}
          <TwitterShareButton
            url="https://uber.github.io/streetscape.gl/"
            hashtags={['streetscapegl']}
          >
            <TwitterIcon size={32} />
          </TwitterShareButton>
        </SocialContainer>

        <LogosContainer>
          <SectionText>partnership with</SectionText>
          <StyledLogo>
            <a target="_blank" rel="noopener noreferrer" href="https://voyage.auto/">
              Voyage Auto
            </a>
          </StyledLogo>
          <MapboxLogo />
        </LogosContainer>

        <BrandingContainer>
          <img src={UBER_LOGO} />
          <SectionText>created by</SectionText>
          <VisGLLogo logo={VIS_LOGO}>
            <a target="_blank" rel="noopener noreferrer" href="http://vis.gl">
              VIS.GL
            </a>
          </VisGLLogo>
        </BrandingContainer>
      </Container>
    );
  }
}
