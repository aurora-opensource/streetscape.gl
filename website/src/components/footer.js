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
import {DEMO_LINK, STREETSCAPE_GL_LOGO, UBER_LOGO, VIS_LOGO} from '../contents/content';

const Container = styled.div`
  background: #242730;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${props => props.theme.margins.medium};
`;

const LogosContainer = styled.div`
  display: flex;
  justify-content: space-between;
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

const StreetscapeLogo = styled.img`
  width: 120px;
  ${media.palm`
    position: inherit;
    margin-top: ${props => props.theme.margins.normal};
    margin-bottom: ${props => props.theme.margins.small};
  `};
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

const ButtonSection = styled.div`
  display: flex;
  margin-top: 32px;
  justify-content: space-between;

  ${media.palm`
    display: flex;
    margin-top: 18px;
    justify-content: center;
    width: 100%;
    flex-direction: column;
  `};
`;

const PartnerSection = styled.div`
  display: flex;
  justify-content: center;

  ${media.palm`
    margin-top: 18px;
    align-items: center;
    display: flex;
    justify-content: center;
    width: 100%;
    flex-direction: column;
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
    margin-top: 18px;
    width: 100%;
  `};
`;

const GithubLink = styled.span`
  margin-right: 8px;
`;

export default class Footer extends PureComponent {
  render() {
    return (
      <Container>
        <LogosContainer>
          <StreetscapeLogo src={STREETSCAPE_GL_LOGO} />
          <BrandingContainer>
            <a target="_blank" rel="noopener noreferrer" href="https://www.uber.com">
              <img src={UBER_LOGO} height={16} />
            </a>
            <SectionText>created by</SectionText>
            <VisGLLogo logo={VIS_LOGO}>
              <a target="_blank" rel="noopener noreferrer" href="http://vis.gl">
                VIS.GL
              </a>
            </VisGLLogo>
          </BrandingContainer>
        </LogosContainer>

        <ButtonSection>
          <ButtonContainer>
            <LinkButton
              large
              href={DEMO_LINK}
              style={{marginRight: '5px', ...media.palm('margin-bottom: 5px;')}}
            >
              Try demo
            </LinkButton>
            <LinkButton large outlineDark href="https://github.com/uber/streetscape.gl">
              <GithubLink className={'icon-github'} /> Github
            </LinkButton>
          </ButtonContainer>

          <PartnerSection>
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
              <MapboxLogo />
            </div>
          </PartnerSection>

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
        </ButtonSection>
      </Container>
    );
  }
}
