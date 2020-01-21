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
import document from 'global/document';
import {createStore} from 'redux';

import renderRoot from './components/root';

const getHeight = that => that.model.get('height');
const getPort = that => that.model.get('port');
const getLog = that => that.model.get('log');
const getMapboxAccessToken = that => that.model.get('mapboxAccessToken');

const DOM_EL_ID = 'streetscapegl';
let counter = 0;

function reducer(state = [], action) {
  return state;
}

export class StreetscapeGLJupyter {
  constructor() {
    this.id = `${DOM_EL_ID}-${counter}`;
    counter++;
    this.mapUpdateCounter = 0;
  }

  create(that) {
    this.store = createStore((state = [], action) => state, {
      log: getLog(that),
      port: getPort(that),
      mapboxAccessToken: getMapboxAccessToken(that)
    });

    const height = 600; // getHeight(that);

    that.el.classList.add('jupyter-widgets');
    that.el.classList.add('streetscapegl-jupyter-widgets');

    const divElmt = document.createElement('div');
    divElmt.setAttribute('id', this.id);
    divElmt.classList.add('streetscape-gl');
    divElmt.setAttribute('style', ` width: 100%; height: ${height}px;`);
    that.el.appendChild(divElmt);

    renderRoot({id: this.id, store: this.store, ele: divElmt});
  }
}
