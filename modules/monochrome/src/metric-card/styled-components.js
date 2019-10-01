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

export const CardContainer = styled.div(props => ({
  ...props.theme.__reset__,
  position: 'relative',
  fontSize: props.theme.fontSize,
  ...evaluateStyle(props.userStyle, props)
}));

export const CardTitle = styled.div(props => ({
  textAlign: 'center',
  fontWeight: 200,
  fontSize: '1.6em',
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  ...evaluateStyle(props.userStyle, props)
}));

export const ErrorMessage = styled.div(props => ({
  fontWeight: 'bold',
  textAlign: 'center',
  margin: props.theme.spacingNormal,
  color: props.theme.textColorError,
  ...evaluateStyle(props.userStyle, props)
}));

// react-vis styles
/* Adpated from react-vis/dist/styles/plot.scss */
export const ChartContainer = styled.div(props => ({
  ...props.theme.__reset__,
  cursor: 'pointer',
  background: props.theme.background,

  '.rv-xy-plot': {
    color: props.theme.textColorPrimary,
    position: 'relative'
  },
  '.rv-xy-plot__inner': {
    display: 'block',
    position: 'relative',
    zIndex: 1
  },
  '.rv-xy-plot__axis__line': {
    display: 'none'
  },
  '.rv-xy-plot__axis__tick__line': {
    display: 'none'
  },
  '.rv-xy-plot__axis__tick__text': {
    fill: props.theme.textColorPrimary,
    fontSize: '0.8em'
  },
  '.rv-xy-plot__series, .rv-xy-plot__series path': {
    pointerEvents: 'all'
  },
  '.rv-xy-plot__series--line': {
    fill: 'none',
    stroke: '#000',
    strokeWidth: 2
  },
  '.rv-xy-plot__grid-lines__line': {
    stroke: props.theme.textColorSecondary,
    strokeDasharray: '1,2'
  },
  '.rv-xy-plot__series--mark circle': {
    pointerEvents: 'none'
  },

  '.rv-crosshair': {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: props.theme.fontSize
  },
  '.rv-crosshair__line': {
    background: props.theme.textColorPrimary,
    width: 1
  },
  '.rv-crosshair__inner': {
    zIndex: 2,
    margin: -6,
    transform: 'translateY(100%)',
    bottom: 0,
    display: 'none',
    position: 'absolute',
    textAlign: 'left'
  },
  '&:hover .rv-crosshair__inner': {
    display: 'block'
  },
  '.rv-crosshair__inner__content': {
    borderRadius: 2,
    background: props.theme.backgroundInvert,
    color: props.theme.textColorInvert,
    padding: props.theme.spacingSmall,
    boxShadow: props.theme.shadow,

    ...evaluateStyle(props.tooltipStyle, props)
  },
  '.rv-crosshair__item': {
    whiteSpace: 'nowrap',
    fontSize: '0.9em',
    lineHeight: '18px',
    position: 'relative'
  },

  ...evaluateStyle(props.userStyle, props)
}));

export const CrosshairItemTitle = styled.span(props => ({
  fontWeight: 'bold',
  marginRight: props.theme.spacingTiny,

  ...evaluateStyle(props.userStyle, props)
}));

export const CrosshairItemValue = styled.span(props => ({
  span: {
    color: props.theme.textColorSecondary,
    marginLeft: props.theme.spacingTiny
  },

  ...evaluateStyle(props.userStyle, props)
}));

export const CrosshairItemLegend = styled.div(props => {
  const style = {
    background: props.color,
    width: 4,
    left: -10,
    height: 18,
    top: 0,
    bottom: 0,
    position: 'absolute'
  };

  if (props.isFirst) {
    style.height += props.theme.spacingSmall;
    style.top = -props.theme.spacingSmall;
    style.borderTopLeftRadius = 4;
  }
  if (props.isLast) {
    style.height += props.theme.spacingSmall;
    style.bottom = -props.theme.spacingSmall;
    style.borderBottomLeftRadius = 4;
  }

  return Object.assign(style, evaluateStyle(props.userStyle, props));
});

export const FilterContainer = styled.div(props => ({
  ...props.theme.__reset__,
  position: 'relative',
  paddingLeft: props.theme.spacingLarge,
  fontSize: props.theme.fontSize,

  ...evaluateStyle(props.userStyle, props)
}));

export const FilterToggle = styled.div(props => ({
  position: 'absolute',
  left: 0,
  cursor: 'pointer',
  fontWeight: 'bold',
  width: 16,
  height: 16,

  ...evaluateStyle(props.userStyle, props)
}));

export const FilterItem = styled.div(props => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginBottom: props.theme.spacingTiny,

  fontWeight: props.isHovered ? 'bold' : 'normal',
  color: props.isActive ? props.theme.textColorPrimary : props.theme.textColorDisabled,

  ...evaluateStyle(props.userStyle, props)
}));

export const FilterLegend = styled.div(props => ({
  display: 'inline-block',
  width: 16,
  height: 16,
  textAlign: 'center',
  lineHeight: '16px',
  marginRight: props.theme.spacingSmall,
  color: props.isActive ? props.color : props.theme.textColorDisabled,
  path: {fill: 'currentColor'},

  ...evaluateStyle(props.userStyle, props)
}));
