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

import styled from '@emotion/styled';
import {evaluateStyle} from '../theme';

const ContainerComponent = styled.div(props => ({
  margin: -props.tolerance,
  padding: props.tolerance,
  cursor: props.isActive ? 'grabbing' : props.isEnabled ? 'grab' : 'inherit',

  ...evaluateStyle(props.userStyle, props)
}));

const BACKDROP_STYLES = {
  position: 'fixed',
  zIndex: 999,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
};

function noop() {}

/**
 * @class
 */
export default class Draggable extends PureComponent {
  static propTypes = {
    // container
    className: PropTypes.string,
    // config
    style: PropTypes.object,
    tolerance: PropTypes.number,
    isEnabled: PropTypes.bool,
    // callbacks
    onDragStart: PropTypes.func,
    onDrag: PropTypes.func,
    onDragEnd: PropTypes.func
  };

  static defaultProps = {
    className: '',
    isEnabled: true,
    tolerance: 0,
    onDragStart: noop,
    onDrag: noop,
    onDragEnd: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      isMouseDown: false,
      dragStartPos: null,
      hasDragged: false
    };
  }

  _getEventData = (evt, offset = this.state.offset) => {
    const {dragStartPos, hasDragged} = this.state;
    const result = {
      srcEvent: evt,
      x: evt.clientX,
      y: evt.clientY,
      offsetX: evt.clientX - offset.left,
      offsetY: evt.clientY - offset.top,
      hasDragged
    };
    if (dragStartPos) {
      result.deltaX = result.x - dragStartPos.x;
      result.deltaY = result.y - dragStartPos.y;
    } else {
      result.deltaX = 0;
      result.deltaY = 0;
    }
    return result;
  };

  _onMouseDown = evt => {
    if (!this.props.isEnabled) {
      return;
    }
    evt.stopPropagation();

    const offset = this._element.getBoundingClientRect();
    const eventData = this._getEventData(evt, offset);

    this.setState({
      isMouseDown: true,
      hasDragged: false,
      offset,
      dragStartPos: {x: eventData.x, y: eventData.y}
    });
    this.props.onDragStart(eventData);
  };

  _onMouseMove = evt => {
    if (!this.props.isEnabled) {
      return;
    }
    evt.stopPropagation();

    if (this.state.isMouseDown) {
      const eventData = this._getEventData(evt);
      const {deltaX, deltaY} = eventData;

      if (!this.state.hasDragged) {
        if (deltaX || deltaY) {
          this.setState({hasDragged: true});
        } else {
          return;
        }
      }
      this.props.onDrag(eventData);
    }
  };

  _onMouseUp = evt => {
    if (this.state.isMouseDown) {
      this.setState({
        isMouseDown: false,
        dragStartPos: null
      });
      this.props.onDragEnd(this._getEventData(evt));
    }
  };

  render() {
    const {style, isEnabled, className, tolerance} = this.props;
    const {isMouseDown} = this.state;

    return (
      <ContainerComponent
        className={className}
        ref={ref => {
          this._element = ref;
        }}
        tolerance={tolerance}
        isEnabled={isEnabled}
        isActive={isMouseDown}
        userStyle={style}
        onMouseDown={this._onMouseDown}
        onMouseMove={this._onMouseMove}
        onMouseLeave={this._onMouseUp}
        onMouseUp={this._onMouseUp}
      >
        {isMouseDown && <div style={BACKDROP_STYLES} />}

        {this.props.children}
      </ContainerComponent>
    );
  }
}
