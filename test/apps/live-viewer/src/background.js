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
import {AutoSizer} from '@streetscape.gl/monochrome';

export class Background extends PureComponent {
  static propTypes = {
    src: PropTypes.object,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  };

  static defaultProps = {
    width: '100%',
    height: 'auto'
  };

  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0
    };

    this._canvas = null;
    this._context = null;
  }

  componentDidMount() {
    this._renderFrame();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.width !== prevState.width ||
      this.state.height !== prevState.height ||
      this.props.src !== prevProps.src
    ) {
      this._renderFrame();
    }
  }

  _onCanvasLoad = ref => {
    this._canvas = ref;

    if (ref) {
      this._context = ref.getContext('2d');
    }
  };

  _onCanvasResize = ({width, height}) => {
    this.setState({width, height});
  };

  _renderFrame = () => {
    if (!this._context) {
      return;
    }

    const width = this.state.width;
    let height = this.state.height;

    if (!width) {
      return;
    }

    const {src} = this.props;
    if (!src) {
      this._context.clearRect(0, 0, width, height);
    } else {
      if (this.props.height === 'auto') {
        height = (width / src.width) * src.height;
      }
      this._canvas.width = width;
      this._canvas.height = height;
      this._context.drawImage(src, 0, 0, width, height);
    }
  };

  render() {
    const {width, height} = this.props;
    const style = {
      background: '#000',
      lineHeight: 0,
      position: 'fixed',
      top: '20%',
      left: 0,
      width,
      height
    };

    return (
      <div style={style}>
        <AutoSizer onResize={this._onCanvasResize} />
        <canvas ref={this._onCanvasLoad} />
      </div>
    );
  }
}
