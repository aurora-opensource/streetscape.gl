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
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Waypoint from 'react-waypoint';

const StyledContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 200px;
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  transform-style: preserve-3d;
  perspective-origin: center;
`;

const Item = styled.div`
  position: absolute;
  transition: transform 1s;
  cursor: pointer;
  transform: ${props => props.transform};
`;

const WrappedContainer = ({innerRef, Container, children}) => {
  return innerRef ? <Container ref={innerRef}>{children}</Container> : null;
};

export default class Carousel extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    selectedIndex: PropTypes.number.isRequired,
    xOffset: PropTypes.number,
    zOffset: PropTypes.number
  };

  static defaultProps = {
    xOffset: 15,
    yOffset: 0,
    zOffset: 60,
    xRotate: 0,
    yRotate: 0,
    zRotate: 0,
    xScale: 1,
    yScale: 1,
    zScale: 1
  };

  state = {
    isVisible: false
  };

  _onWaypointEnter = () => {
    this.setState({isVisible: true});
  };

  _onWaypointLeave = () => {
    this.setState({isVisible: false});
  };

  _getTransform(index) {
    const {
      selectedIndex,
      xOffset,
      yOffset,
      zOffset,
      xRotate,
      yRotate,
      zRotate,
      xScale,
      yScale,
      zScale,
      getTransform
    } = this.props;

    const {isVisible} = this.state;
    if (getTransform) {
      return getTransform({index, isVisible});
    }

    const translateX = isVisible ? (index - selectedIndex) * xOffset : 0;
    const translateY = isVisible ? (index - selectedIndex) * yOffset : 0;
    const translateZ = -Math.abs(index - selectedIndex) * zOffset;
    const rotateX = Math.sign(index - selectedIndex) * xRotate;
    const rotateY = Math.sign(index - selectedIndex) * yRotate;
    const rotateZ = Math.sign(index - selectedIndex) * zRotate;
    const scaleX = index - selectedIndex === 0 ? 1 : xScale;
    const scaleY = index - selectedIndex === 0 ? 1 : yScale;
    const scaleZ = index - selectedIndex === 0 ? 1 : zScale;

    return `
      perspective(600px)
      translate3d(${translateX}%, ${translateY}%, ${translateZ}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      rotateZ(${rotateZ}deg)
      scale3d(${scaleX}, ${scaleY}, ${scaleZ});
    `;
  }

  render() {
    const {children} = this.props;
    return (
      <Waypoint onEnter={this._onWaypointEnter} onLeave={this._onWaypointLeave}>
        <WrappedContainer Container={StyledContainer}>
          <Content>
            {children.map((item, i) => {
              return (
                <Item
                  key={`carousel-item-${i}`}
                  transform={this._getTransform(i)}
                  onClick={() => {
                    this.props.onChange(i);
                  }}
                >
                  {item}
                </Item>
              );
            })}
          </Content>
        </WrappedContainer>
      </Waypoint>
    );
  }
}
