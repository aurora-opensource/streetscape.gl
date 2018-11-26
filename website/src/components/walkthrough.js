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

import {STEPS} from '../contents/content';
import {media} from '../styles';
import StaggeredScrollAnimation from './common/staggered-scroll-animation';
import {LinkButton} from './common/styled-components';

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin-bottom: ${props => props.theme.margins.large};
`;

const StepsRow = styled.div`
  display: flex;
  justify-content: center;
`;

const StepColumn = styled.div`
  display: flex;
  text-align: center;
  width: 350px;
  padding: 24px;
  margin: ${props => props.theme.margins.small};
  ${media.palm`
    margin: 0px;
    margin-bottom: ${props => props.theme.margins.small}
  `};
`;

const StepContainer = styled(StepColumn)`
  flex-direction: column;
  align-items: center;
`;

const StepTitle = styled.div`
  text-transform: 'uppercase';
  font-size: 32px;
  font-weight: 500;
  margin-bottom: ${props => props.theme.margins.small};
`;

const StepDescription = styled.div`
  font-size: 16px;
  color: #c7cbcf;
  margin-bottom: ${props => props.theme.margins.small};
`;

const NumberCircle = styled.div`
  border-radius: 50%;
  width: 36px;
  height: 36px;
  background: #c7cbcf;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavItemContainer = styled(StepColumn)`
  margin-bottom: 0;
  padding-bottom: 0;
  justify-content: center;
`;

const Step = ({index, title, description, link}) => (
  <StepContainer>
    <StepTitle>{title}</StepTitle>
    <StepDescription>{description}</StepDescription>
    {link && (
      <LinkButton secondary none link href={link.url}>
        {link.title} &nbsp; &rarr;
      </LinkButton>
    )}
  </StepContainer>
);

const NavItem = ({index}) => (
  <NavItemContainer>
    <NumberCircle>{index}</NumberCircle>
  </NavItemContainer>
);

class Walkthrough extends PureComponent {
  render() {
    return (
      <div>
        <StaggeredScrollAnimation Container={StepsContainer}>
          <StepsRow>
            {STEPS.map((_, i) => (
              <NavItem key={`step-${i}`} index={i + 1} />
            ))}
          </StepsRow>
          <StepsRow>
            {STEPS.map(({title, description, link}, i) => (
              <Step
                key={`step-${i}`}
                index={i + 1}
                title={title}
                description={description}
                link={link}
              />
            ))}
          </StepsRow>
        </StaggeredScrollAnimation>
      </div>
    );
  }
}

export default Walkthrough;
