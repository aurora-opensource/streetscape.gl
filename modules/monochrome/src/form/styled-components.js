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

export const Container = styled.div(props => ({
  ...props.theme.__reset__,
  ...evaluateStyle(props.userStyle, props)
}));

export const Expander = styled.div(props => ({
  position: 'absolute',
  cursor: 'pointer',
  left: -20,
  top: 4,
  width: 16,
  height: 16,

  color: props.theme.controlColorPrimary,
  '&:hover': {
    color: props.theme.controlColorHovered
  },
  path: {
    fill: 'currentColor'
  },

  ...evaluateStyle(props.userStyle, props)
}));

export const Title = styled.div(props => ({
  marginTop: props.theme.spacingNormal,
  marginBottom: props.theme.spacingNormal,
  fontSize: props.theme.fontSize * 2,
  fontWeight: 200,
  ...evaluateStyle(props.userStyle, props)
}));

export const Heading = styled.div(props => ({
  marginTop: props.theme.spacingNormal,
  marginBottom: props.theme.spacingNormal,
  fontSize: props.theme.fontSize * 1.2,
  fontWeight: 600,
  ...evaluateStyle(props.userStyle, props)
}));

export const Separator = styled.div(props => ({
  width: '100%',
  height: 1,
  background: props.theme.controlColorSecondary,
  ...evaluateStyle(props.userStyle, props)
}));
