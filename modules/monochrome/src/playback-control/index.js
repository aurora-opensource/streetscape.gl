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

import AutoSizer from '../shared/autosizer';
import Slider from '../shared/slider';
import {getTimelineTicks, formatTimeCode} from './utils';
import {scaleLinear} from 'd3-scale';

import {withTheme} from '../shared/theme';

import {
  WrapperComponent,
  ControlsContainer,
  PlayPauseButton,
  Timestamp,
  TicksContainer,
  Tick,
  TickLabel,
  MarkersContainer,
  MarkerComponent,
  BufferComponent
} from './styled-components.js';
import {PlayIcon, PauseIcon} from '../shared/icons';

const DEFAULT_PADDING = 24;
const COMPACT_CONTAINER_STYLE = {display: 'flex', alignItems: 'flex-end'};

function noop() {}

function normalizePadding(padding) {
  padding = padding || 0;
  if (Number.isFinite(padding)) {
    return {right: padding, left: padding};
  }
  return Object.assign(
    {
      right: 0,
      left: 0
    },
    padding
  );
}

/*
 * @class
 */
class PlaybackControl extends PureComponent {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    style: PropTypes.object,
    compact: PropTypes.bool,

    currentTime: PropTypes.number.isRequired,
    startTime: PropTypes.number,
    endTime: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    className: PropTypes.string,

    // config
    step: PropTypes.number,
    tickSpacing: PropTypes.number,
    bufferRange: PropTypes.arrayOf(PropTypes.object),
    markers: PropTypes.arrayOf(PropTypes.object),

    // callbacks
    formatTick: PropTypes.func,
    formatTimestamp: PropTypes.func,
    onPlay: PropTypes.func,
    onPause: PropTypes.func,
    onSeek: PropTypes.func
  };

  static defaultProps = {
    style: {},
    compact: false,

    className: '',
    startTime: 0,
    step: 0.1,
    tickSpacing: 100,
    formatTick: x => formatTimeCode(x, '{mm}:{ss}'),
    formatTimestamp: x => formatTimeCode(x, '{mm}:{ss}.{S}'),
    onPlay: noop,
    onPause: noop,
    onSeek: noop
  };

  constructor(props) {
    super(props);
    this.scale = scaleLinear();
  }

  componentDidUpdate(prevProps) {
    const props = this.props;

    if (
      prevProps.step !== props.step ||
      prevProps.startTime !== props.startTime ||
      prevProps.endTime !== props.endTime
    ) {
      // Video source has changed
      // Kill any running animation to avoid callbacks in incorrect time range
      this._pause();
      // Update currentTime to make sure it is the start of the new range
      this._seek(props.startTime);
    }
  }

  componentWillUnmount() {
    this._pause();
  }

  _play = () => {
    this.props.onPlay();
  };

  _pause = () => {
    this.props.onPause();
  };

  _seek = newTime => {
    const {currentTime} = this.props;

    if (newTime !== currentTime) {
      this.props.onSeek(newTime);
    }
  };

  _onResize = ({width}) => {
    let {padding = 24} = this.props.style;
    padding = normalizePadding(padding);
    this.scale.range([0, width - padding.left - padding.right]);
    // Trigger rerender
    this.setState({width});
  };

  _renderMarker(marker, i, Component, styleProps, userStyle) {
    const {scale} = this;
    const {startTime = marker.time, endTime = marker.time, style, content} = marker;
    const x0 = scale(startTime);
    const x1 = scale(endTime);

    const markerStyle = {
      ...style,
      position: 'absolute',
      left: x0,
      width: x1 - x0
    };

    return (
      <Component key={i} {...styleProps} style={markerStyle} userStyle={userStyle}>
        {content}
      </Component>
    );
  }

  _renderTimeline(styleProps) {
    const {style, tickSpacing, formatTick, markers} = this.props;
    const {scale} = this;
    const ticks = getTimelineTicks(scale, tickSpacing, formatTick);

    return (
      <div>
        <TicksContainer {...styleProps} userStyle={style.ticks}>
          {ticks.map((t, i) => {
            const tickStyle = {
              position: 'absolute',
              left: t.x
            };
            return (
              <Tick key={i} {...styleProps} userStyle={style.tick} style={tickStyle}>
                <TickLabel {...styleProps} userStyle={style.tickLabel}>
                  {t.label}
                </TickLabel>
              </Tick>
            );
          })}
        </TicksContainer>

        {markers && (
          <MarkersContainer {...styleProps} userStyle={style.markers}>
            {markers.map((marker, i) =>
              this._renderMarker(marker, i, MarkerComponent, styleProps, style.marker)
            )}
          </MarkersContainer>
        )}
      </div>
    );
  }

  _renderSlider(styleProps) {
    const {style, currentTime, startTime, endTime, step, bufferRange = []} = this.props;

    const buffers = Array.isArray(bufferRange) ? bufferRange : [bufferRange];

    return (
      <Slider
        style={style.slider}
        value={currentTime}
        onChange={this._seek}
        knobSize={18}
        step={step}
        min={startTime}
        max={endTime}
      >
        {buffers.map((range, i) =>
          this._renderMarker(range, i, BufferComponent, styleProps, style.buffer)
        )}
      </Slider>
    );
  }

  _renderPlayPauseButton(styleProps) {
    const {isPlaying, style} = this.props;

    return (
      <PlayPauseButton
        {...styleProps}
        userStyle={style.playPauseButton}
        onClick={isPlaying ? this._pause : this._play}
      >
        {isPlaying ? style.iconPause || <PauseIcon /> : style.iconPlay || <PlayIcon />}
      </PlayPauseButton>
    );
  }

  _renderTimestamp(styleProps) {
    const {style, currentTime, formatTimestamp} = this.props;
    return (
      <Timestamp {...styleProps} userStyle={style.timestamp}>
        {formatTimestamp(currentTime)}
      </Timestamp>
    );
  }

  render() {
    const {theme, compact, width, style, className, isPlaying, startTime, endTime} = this.props;

    let {padding = DEFAULT_PADDING} = style;
    padding = normalizePadding(padding);

    this.scale.domain([startTime, endTime]);

    const styleProps = {
      theme,
      compact,
      isPlaying
    };

    const wrapperStyle = {width};

    if (compact) {
      const sliderStyle = {
        flexGrow: 1,
        paddingLeft: padding.left,
        paddingRight: padding.right
      };

      return (
        <WrapperComponent
          className={className}
          {...styleProps}
          userStyle={style.wrapper}
          style={wrapperStyle}
        >
          <div style={COMPACT_CONTAINER_STYLE}>
            {this._renderPlayPauseButton(styleProps)}
            <div style={sliderStyle}>
              <AutoSizer disableHeight={true} onResize={this._onResize} />
              {this._renderTimeline(styleProps)}
              {this._renderSlider(styleProps)}
            </div>
            {this._renderTimestamp(styleProps)}
          </div>

          <ControlsContainer {...styleProps} userStyle={style.controls}>
            {this.props.children}
          </ControlsContainer>
        </WrapperComponent>
      );
    }

    Object.assign(wrapperStyle, {
      paddingLeft: padding.left,
      paddingRight: padding.right
    });

    return (
      <WrapperComponent
        className={className}
        {...styleProps}
        userStyle={style.wrapper}
        style={wrapperStyle}
      >
        <AutoSizer disableHeight={true} onResize={this._onResize} />
        {this._renderTimeline(styleProps)}
        {this._renderSlider(styleProps)}

        <ControlsContainer {...styleProps} userStyle={style.controls}>
          {this._renderPlayPauseButton(styleProps)}
          {this._renderTimestamp(styleProps)}
          {this.props.children}
        </ControlsContainer>
      </WrapperComponent>
    );
  }
}

const ThemedPlaybackControl = withTheme(PlaybackControl);
ThemedPlaybackControl.formatTimeCode = formatTimeCode;

export default ThemedPlaybackControl;
