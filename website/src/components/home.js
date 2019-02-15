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
import {ThemeProvider} from 'styled-components';
import {window} from 'global';

import {theme, breakPoints} from '../styles';
import {SECTIONS} from '../contents/content';
import Hero from './hero';
import Usecases from './usecases';
import Elements from './elements';
import Walkthrough from './walkthrough';
import Features from './features';
import Footer from './footer';
import Section from './common/section';
import styled from 'styled-components';

const SECTION_CONTENT = {
  walkthrough: Walkthrough,
  usecases: Usecases,
  elements: Elements,
  features: Features
};

const Container = styled.div`
  margin-top: -64px;
`;

export default class Home extends PureComponent {
  state = {
    selectedIndex: 0,
    width: window.innerWidth,
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
      <ThemeProvider theme={theme}>
        <Container>
          <Hero />
          {SECTIONS.map(({id, title, description, icon, isDark, background}, i) => {
            const SectionContent = SECTION_CONTENT[id];
            return (
              <Section
                key={`section-${i}`}
                title={title}
                description={description}
                icon={icon}
                isDark={isDark}
                marginBottom={'0px'}
                background={background}
              >
                <SectionContent isPalm={isPalm} />
              </Section>
            );
          })}
          <Footer />
        </Container>
      </ThemeProvider>
    );
  }
}
