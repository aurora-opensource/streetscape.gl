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
import {keyframes} from '@emotion/core';

import {withTheme, evaluateStyle} from '../theme';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const PreLoader = styled.div(props => ({
  width: props.size,
  height: props.size,
  marginLeft: -props.size / 2,
  marginTop: props.theme.spacingNormal,
  marginBottom: props.theme.spacingNormal,
  left: '50%',
  borderRadius: '50%',
  position: 'absolute',
  borderStyle: 'solid',
  borderWidth: 2,
  borderColor: props.theme.controlColorActive,
  clipPath: 'polygon(50% 0%, 50% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)',
  animation: `${spin} 1s ease infinite`,

  ...evaluateStyle(props.userStyle, props)
}));

class Spinner extends PureComponent {
  static propTypes = {
    style: PropTypes.object
  };

  static defaultProps = {
    style: {}
  };

  render() {
    const {theme, style} = this.props;
    const {size = 32} = style;
    return <PreLoader size={size} theme={theme} userStyle={style} />;
  }
}

export default withTheme(Spinner);
