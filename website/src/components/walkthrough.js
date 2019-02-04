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

import Nav from './common/nav';
import StaggeredScrollAnimation from './common/staggered-scroll-animation';
import {LinkButton} from './common/styled-components';
import {media} from '../styles';
import {STEPS} from '../contents/content';

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
  justify-content: space-between;
  width: 350px;
  padding: 24px;
  margin: ${props => props.theme.margins.small};
  ${media.palm`
    margin: 0 auto;
    margin-bottom: ${props => props.theme.margins.small}
  `};
`;

const StepContainer = styled(StepColumn)`
  flex-direction: column;
  align-items: center;
`;

const StepTitle = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 32px;
  font-weight: 500;
  margin-bottom: ${props => props.theme.margins.small};
  ${media.palm`
    font-size: 24px;
  `};
`;

const StepDescription = styled.div`
  flex-grow: 1;
  font-size: 16px;
  line-height: 1.5em;
  min-height: 4.5em;
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
  ${media.palm`
    font-size: 18px;
    width: 28px;
    height: 28px;
  `};
`;

const NumberContainer = styled(StepColumn)`
  margin-bottom: 0;
  padding: 0;
  justify-content: center;
  ${media.palm`
    width: auto;
    margin-bottom: 0;
    margin-right: ${props => props.theme.margins.tiny};
  `};
`;

const Number = ({number}) => (
  <NumberContainer>
    <NumberCircle>{number}</NumberCircle>
  </NumberContainer>
);

const Step = ({showStep = false, index, title, description, link}) => (
  <StepContainer>
    <StepTitle>
      {showStep && <Number inline number={index + 1} />}
      {title}
    </StepTitle>
    <StepDescription>{description}</StepDescription>
    {link && (
      <LinkButton secondary background="transparent" link href={link.url}>
        {link.title} &nbsp; &rarr;
      </LinkButton>
    )}
  </StepContainer>
);

class Walkthrough extends PureComponent {
  state = {
    selectedIndex: 0
  };

  _renderSteps = () => {
    const selectedIndex = this.state.selectedIndex;
    if (this.props.isPalm) {
      const {title, description, link} = STEPS[selectedIndex];
      return (
        <div>
          <Step
            index={selectedIndex}
            title={title}
            showStep={true}
            description={description}
            link={link}
          />
          <Nav
            items={STEPS}
            selectedIndex={selectedIndex}
            onClick={i => {
              this.setState({selectedIndex: i});
            }}
          />
        </div>
      );
    }

    return (
      <StaggeredScrollAnimation Container={StepsContainer}>
        <StepsRow>
          {STEPS.map((_, i) => (
            <Number key={i} number={i + 1} />
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
    );
  };

  render() {
    return <div>{this._renderSteps()}</div>;
  }
}

export default Walkthrough;
