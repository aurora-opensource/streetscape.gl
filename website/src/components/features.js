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

import {getImageUrl} from '../contents/content';
import {LinkButton, CenteredContent} from './common/styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const BackgroundImage = styled.img`
  width: 100%;
  height: 100%;
  max-width: 1200px;
  margin-bottom: ${props => props.theme.margins.large};
`;

class Features extends PureComponent {
  render() {
    return (
      <Container>
        <BackgroundImage
          src={getImageUrl(this.props.isPalm ? 'ui-controls-palm.png' : 'ui-controls.png')}
        />
        <CenteredContent>
          <LinkButton large outline href="#/streetscape.gl/getting-started/starter-kit">
            Get Started
          </LinkButton>
        </CenteredContent>
      </Container>
    );
  }
}

export default Features;
