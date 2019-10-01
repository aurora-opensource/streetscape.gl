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
import {withTheme, evaluateStyle} from '../theme';

import Draggable from '../draggable';
import {clamp} from '../../utils/math';

function snap(x, min, max, step) {
  if (step > 0) {
    x = Math.round((x - min) / step) * step + min;
  }
  return clamp(x, min, max);
}

const SliderWrapper = styled.div(props => ({
  ...props.theme.__reset__,
  outline: 'none',
  color: props.isEnabled ? props.theme.textColorPrimary : props.theme.textColorDisabled,
  cursor: 'pointer',
  pointerEvents: props.isEnabled ? 'all' : 'none',
  paddingTop: props.knobSize / 2,
  paddingBottom: props.knobSize / 2,
  ...evaluateStyle(props.userStyle, props)
}));

const SliderTrack = styled.div(props => ({
  position: 'relative',
  width: '100%',
  background: props.isEnabled ? props.theme.controlColorPrimary : props.theme.controlColorDisabled,
  height: 2,
  ...evaluateStyle(props.userStyle, props)
}));

const SliderTrackFill = styled.div(props => ({
  position: 'absolute',
  transitionProperty: 'width',
  transitionDuration: props.isDragging ? '0s' : props.theme.transitionDuration,
  transitionTimingFunction: props.theme.transitionTimingFunction,
  height: '100%',
  background: props.isEnabled ? props.theme.controlColorActive : props.theme.controlColorDisabled,
  ...evaluateStyle(props.userStyle, props)
}));

const SliderKnob = styled.div(props => ({
  position: 'absolute',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: props.isEnabled
    ? props.isHovered
      ? props.theme.controlColorHovered
      : props.hasFocus
        ? props.theme.controlColorActive
        : props.theme.controlColorPrimary
    : props.theme.controlColorDisabled,
  background: props.theme.background,
  boxSizing: 'border-box',
  width: props.knobSize,
  height: props.knobSize,
  borderRadius: '50%',
  margin: -props.knobSize / 2,
  top: '50%',
  transitionProperty: 'left',
  transitionDuration: props.isDragging ? '0s' : props.theme.transitionDuration,

  ...evaluateStyle(props.userStyle, props)
}));

/*
 * @class
 */
class Slider extends PureComponent {
  static propTypes = {
    value: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    step: PropTypes.number,
    label: PropTypes.string,
    tooltip: PropTypes.string,
    badge: PropTypes.element,
    isEnabled: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    style: {},
    step: 0,
    isEnabled: true,
    onChange: () => {}
  };

  state = {
    width: 1,
    isHovered: false,
    hasFocus: false,
    isDragging: false,
    hasDragged: false
  };

  _updateValue = (offsetX, width) => {
    const {min, max, step} = this.props;
    const pos = clamp(offsetX / width, 0, 1);
    const value = snap(min + (max - min) * pos, min, max, step);

    this.props.onChange(value);
  };

  _onMouseEnter = () => this.setState({isHovered: true});
  _onMouseLeave = () => this.setState({isHovered: false});
  _onFocus = () => this.setState({hasFocus: true});
  _onBlur = () => this.setState({hasFocus: false});

  _onKeyDown = evt => {
    let delta;
    switch (evt.keyCode) {
      case 37: // left
        delta = -1;
        break;
      case 39: // right
        delta = 1;
        break;
      default:
        return;
    }
    const {value, min, max} = this.props;
    const step = this.props.step || (max - min) / 20;
    const newValue = clamp(value + step * delta, min, max);
    if (newValue !== value) {
      this.props.onChange(newValue);
    }
  };

  _onDragStart = evt => {
    const width = this._track.clientWidth;
    this.setState({width});
    this._updateValue(evt.offsetX, width);
    this.setState({isDragging: true});
  };

  _onDrag = evt => {
    this._updateValue(evt.offsetX, this.state.width);
    this.setState({hasDragged: evt.hasDragged});
  };

  _onDragEnd = evt => {
    this.setState({isDragging: false, hasDragged: false});
  };

  render() {
    const {value, min, max, step, isEnabled, children, className, style, theme} = this.props;
    const {isHovered, isDragging, hasFocus, hasDragged} = this.state;

    const {tolerance = 0, knobSize = theme.controlSize} = style;
    const ratio = (snap(value, min, max, step) - min) / (max - min);

    const styleProps = {
      theme,
      knobSize,
      isEnabled,
      isHovered,
      hasFocus,
      isActive: isDragging,
      isDragging: hasDragged
    };
    return (
      <SliderWrapper
        {...styleProps}
        userStyle={style.wrapper}
        className={className}
        tabIndex={isEnabled ? 0 : -1}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        onFocus={this._onFocus}
        onBlur={this._onBlur}
        onKeyDown={this._onKeyDown}
      >
        <Draggable
          tolerance={knobSize / 2 + tolerance}
          onDragStart={this._onDragStart}
          onDrag={this._onDrag}
          onDragEnd={this._onDragEnd}
        >
          <SliderTrack
            userStyle={style.track}
            {...styleProps}
            ref={ref => {
              this._track = ref;
            }}
          >
            {children}
            <SliderTrackFill
              {...styleProps}
              userStyle={style.trackFill}
              style={{width: `${ratio * 100}%`}}
            />
            <SliderKnob {...styleProps} userStyle={style.knob} style={{left: `${ratio * 100}%`}} />
          </SliderTrack>
        </Draggable>
      </SliderWrapper>
    );
  }
}

export default withTheme(Slider);
