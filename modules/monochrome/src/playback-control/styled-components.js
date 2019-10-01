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
import styled from '@emotion/styled';
import {evaluateStyle} from '../shared/theme';

export const WrapperComponent = styled.div(props => {
  const result = {
    ...props.theme.__reset__,
    boxSizing: 'border-box'
  };

  if (props.isPlaying) {
    result.div = {
      transitionDuration: '0s !important'
    };
  }

  return Object.assign(result, evaluateStyle(props.userStyle, props));
});

export const ControlsContainer = styled.div(props => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: props.theme.spacingTiny,

  ...evaluateStyle(props.userStyle, props)
}));

export const PlayPauseButton = styled.div(props => ({
  width: 16,
  height: 16,
  marginLeft: props.compact ? 0 : -8,
  marginRight: props.theme.spacingSmall,
  cursor: 'pointer',

  color: props.theme.controlColorPrimary,
  '&:hover': {
    color: props.theme.controlColorHovered
  },
  path: {
    fill: 'currentColor'
  },

  ...evaluateStyle(props.userStyle, props)
}));

export const Timestamp = styled.div(props => ({
  ...evaluateStyle(props.userStyle, props)
}));

export const TicksContainer = styled.div(props => ({
  position: 'relative',
  height: 20,
  ...evaluateStyle(props.userStyle, props)
}));

export const Tick = styled.div(props => ({
  height: 4,
  bottom: 0,
  borderLeftStyle: 'solid',
  borderLeftWidth: 1,
  borderLeftColor: props.theme.controlColorSecondary,
  ...evaluateStyle(props.userStyle, props)
}));

export const TickLabel = styled.div(props => ({
  transform: 'translate(-50%, -18px)',
  ...evaluateStyle(props.userStyle, props)
}));

export const MarkersContainer = styled.div(props => ({
  position: 'relative',
  height: 3,
  ...evaluateStyle(props.userStyle, props)
}));

export const MarkerComponent = styled.div(props => ({
  height: '100%',
  ...evaluateStyle(props.userStyle, props)
}));

export const BufferComponent = styled.div(props => ({
  height: '100%',
  background: props.theme.controlColorHovered,
  ...evaluateStyle(props.userStyle, props)
}));
