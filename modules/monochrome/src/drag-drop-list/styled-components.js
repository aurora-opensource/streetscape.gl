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

export const ListContainer = styled.div(props => ({
  ...props.theme.__reset__,
  userSelect: 'none',
  ...evaluateStyle(props.userStyle, props)
}));

export const ListItemContainer = styled.div(props => {
  const style = props.isActive
    ? {
        boxSizing: 'border-box',
        position: 'fixed',
        zIndex: 999,
        transitionProperty: 'all',
        transitionTimingFunction: props.theme.transitionTimingFunction,
        transitionDuration: props.isDragging ? 0 : props.theme.transitionDuration,
        boxShadow: props.theme.shadow
      }
    : {};

  return Object.assign(style, evaluateStyle(props.userStyle, props));
});

export const ListItemTitle = styled.div(props => ({
  ...evaluateStyle(props.userStyle, props)
}));

export const ListItemPlaceholder = styled.div(props => ({
  boxSizing: 'border-box',
  transitionProperty: 'height',
  transitionTimingFunction: props.theme.transitionTimingFunction,
  transitionDuration: props.theme.transitionDuration,
  borderStyle: 'dotted',
  borderColor: props.theme.controlColorPrimary,
  borderWidth: 2,

  ...evaluateStyle(props.userStyle, props)
}));
