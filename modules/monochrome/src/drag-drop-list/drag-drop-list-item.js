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
// @flow
/* global window */
import * as React from 'react';
import PropTypes from 'prop-types';

import Draggable from '../shared/draggable';
import {ListItemContainer, ListItemTitle, ListItemPlaceholder} from './styled-components';

const noop = () => {};

const TRANSITION = 300;

export type DragPos = {
  deltaX: number,
  deltaY: number
};
export type Prop = {
  className: string,
  title: React.Node | string,
  removed: boolean,
  onDragStart: Function,
  onDragMove: Function,
  onDragEnd: Function,
  children?: React.Node
};
export type State = {
  isDragging: boolean,
  isActive: boolean,
  width: number,
  height: number,
  dragStartOffset: {left: number, top: number},
  dragPos: DragPos
};
export default class DragDropListItem extends React.PureComponent<Prop, State> {
  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    removed: PropTypes.bool,
    style: PropTypes.object.isRequired,
    onDragStart: PropTypes.func,
    onDragMove: PropTypes.func,
    onDragEnd: PropTypes.func
  };

  static defaultProps = {
    className: '',
    removed: false,
    onDragStart: noop,
    onDragMove: noop,
    onDragEnd: noop
  };

  state: State = {
    isHovered: false,
    isDragging: false,
    isActive: false,
    width: 0,
    height: 0,
    dragStartOffset: {left: 0, top: 0},
    dragPos: {deltaX: 0, deltaY: 0}
  };

  componentWillUnmount() {
    window.clearTimeout(this._timer);
  }

  _container: any;

  _timer = null;

  getBoundingBox() {
    return this._container.getBoundingClientRect();
  }

  _onMouseEnter = () => this.setState({isHovered: true});

  _onMouseLeave = () => this.setState({isHovered: false});

  _onDragStart = (evt: DragPos) => {
    const container = this._container;

    this.setState({
      isDragging: true,
      isActive: true,
      width: container.offsetWidth,
      height: container.offsetHeight,
      dragStartOffset: container.getBoundingClientRect(),
      dragPos: evt
    });

    this.props.onDragStart(evt);
  };

  _onDragMove = (evt: DragPos) => {
    this.setState({dragPos: evt});
    this.props.onDragMove(evt);
  };

  _onDragEnd = (evt: DragPos) => {
    this.setState({
      isDragging: false,
      dragStartOffset: this._container.getBoundingClientRect(),
      dragPos: {deltaX: 0, deltaY: 0}
    });

    if (this.props.removed) {
      // No transition for removed items
      this.props.onDragEnd(evt);
    } else {
      // Wait for transition to be done, then remove z-index and drop shadow
      this._timer = window.setTimeout(() => {
        this.setState({isActive: false});
        this.props.onDragEnd(evt);
      }, TRANSITION);
    }
  };

  renderTitle() {
    const {title} = this.props;
    return typeof title === 'function' ? title() : title;
  }

  renderMover(children) {
    return (
      <Draggable
        onDragStart={this._onDragStart}
        onDrag={this._onDragMove}
        onDragEnd={this._onDragEnd}
      >
        {children}
      </Draggable>
    );
  }

  renderContent() {
    const {className, removed, theme, style} = this.props;
    const {isHovered, isDragging, isActive, width, height, dragPos, dragStartOffset} = this.state;

    const styleProps = {
      theme,
      isRemoved: removed,
      isHovered,
      isDragging,
      isActive
    };

    const title = this.renderTitle();

    const itemStyle = isActive
      ? {
          left: dragStartOffset.left + dragPos.deltaX,
          top: dragStartOffset.top + dragPos.deltaY,
          width,
          height
        }
      : null;

    return title ? (
      <ListItemContainer
        className={className}
        {...styleProps}
        userStyle={style.item}
        style={itemStyle}
      >
        {this.renderMover(
          <ListItemTitle
            {...styleProps}
            userStyle={style.title}
            onMouseEnter={this._onMouseEnter}
            onMouseLeave={this._onMouseLeave}
          >
            {title}
          </ListItemTitle>
        )}
        {this.props.children}
      </ListItemContainer>
    ) : (
      this.renderMover(
        <ListItemContainer
          onMouseEnter={this._onMouseEnter}
          onMouseLeave={this._onMouseLeave}
          className={className}
          {...styleProps}
          userStyle={style.item}
          style={itemStyle}
        >
          {this.props.children}
        </ListItemContainer>
      )
    );
  }

  render() {
    const {theme, removed, style} = this.props;
    const {isHovered, isDragging, isActive, width, height} = this.state;

    const styleProps = {
      theme,
      isRemoved: removed,
      isHovered,
      isDragging,
      isActive
    };

    const placeholderStyle = {
      width,
      height: removed ? 0 : height
    };

    return (
      <div
        ref={ref => {
          this._container = ref;
        }}
      >
        {this.renderContent()}
        {isActive && (
          <ListItemPlaceholder
            {...styleProps}
            userStyle={style.placeholder}
            style={placeholderStyle}
          />
        )}
      </div>
    );
  }
}
