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
import * as widgets from '@jupyter-widgets/base';
import {StreetscapeGLJupyter} from './streetscapegl/streetscape';

export const StreetscapeGLModel = widgets.DOMWidgetModel.extend({
  defaults: {
    ...widgets.DOMWidgetModel.prototype.defaults(),
    _model_name: 'StreetscapeGLModel',
    _model_module: '@streetscape/jupyter-widget',
    _model_module_version: '0.1.0',

    _view_name: 'StreetscapeGLView',
    _view_module: '@streetscape/jupyter-widget',
    _view_module_version: '0.1.0',

    port: 3000,
    log: 'default',
    mapboxToken: ''
  }
});


// Custom View. Renders the widget model.
export const StreetscapeGLView = widgets.DOMWidgetView.extend({
  render() {
    try {
      this.streetscape = new StreetscapeGLJupyter();
      // Model attributes are access through 'this'
      this.streetscape.create(this);
    } catch (err) {
      console.log(err);
    }
  }
});

/**
 * Hides a warning in the mapbox-gl.js library from surfacing in the notebook as text.
 */
function hideMapboxWarning() {
  const missingTokenWarning = document.getElementById('no-token-warning');
  if (missingTokenWarning) {
    missingTokenWarning.style.display = 'none';
  }
}

/* Temporary solution until i get a better one */
window.setInterval(hideMapboxWarning, 2000);
