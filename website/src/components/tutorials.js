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

import Carousel from './common/carousel';
import Nav from './common/nav';
import {media} from '../styles';
import {TUTORIALS} from '../contents/content';

const CarouselContainer = styled.div`
  height: 360px;
  ${media.palm`
    height: 240px;
  `} ${media.desk`
    height: 480px;
  `};
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.25);
  object-fit: cover;

  width: 480px;
  height: 480px;

  ${media.palm`
    width: 300px;
    height: 200px;
  `} ${media.desk`
    width: 560px;
    height: 420px;
  `};
`;

export default class Tutorials extends PureComponent {
  state = {
    selectedIndex: 1
  };

  render() {
    return (
      <div>
        <CarouselContainer>
          <Carousel
            selectedIndex={this.state.selectedIndex}
            onChange={i => this.setState({selectedIndex: i})}
          >
            {TUTORIALS.map(({image}, i) => (
              <Image key={`showcase-image-${i}`} src={image} />
            ))}
          </Carousel>
        </CarouselContainer>
        <Nav
          items={TUTORIALS}
          selectedIndex={this.state.selectedIndex}
          onClick={i => this.setState({selectedIndex: i})}
        />
      </div>
    );
  }
}
