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
import React, {useEffect, useState, useRef} from 'react';
import {StreetscapeJupyter} from './component';

export const STREETSCAPE_GL_JUPYTER_VERSION = '__PACKAGE_VERSION__';

function App(props) {
  const rootElm = useRef(null);
  const [windowDimension, setDimension] = useState({});

  const handleResize = () => {
    if (!rootElm.current) {
      return;
    }

    const width = rootElm.current.offsetWidth;
    const height = rootElm.current.offsetHeight;
    const dimensionToSet = {
      ...(width && width !== windowDimension.width ? {width} : {}),
      ...(height && height !== windowDimension.height ? {height} : {})
    };

    setDimension(dimensionToSet);
  };

  // in Jupyter Lab, parent component has transition when window resize.
  // need to delay call to get the final parent width,
  const resizeDelay = () => window.setTimeout(handleResize, 500);

  useEffect(() => {
    window.addEventListener('resize', resizeDelay);
    return () => window.removeEventListener('resize', resizeDelay);
  }, []);

  return (
    <div
      style={{width: '100%', height: `100%`}}
      ref={rootElm}
      className="streetscapegl-widget-container"
    >
      <StreetscapeJupyter />
      <div style={{position: 'absolute', top: 0, right: 0}}>
        Ver: {STREETSCAPE_GL_JUPYTER_VERSION}
      </div>
    </div>
  );
}

export default App;
