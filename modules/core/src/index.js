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

// streetscape.gl exports

// LAYERS

// The generic XVIZ layer
export {default as XVIZLayer} from './layers/xviz-layer';

// COMPONENTS

export {default as connectToLog} from './components/connect';

export {default as LogViewer} from './components/log-viewer';
export {default as PlaybackControl} from './components/playback-control';
export {default as PerspectivePopup} from './components/log-viewer/perspective-popup';
export {default as StreamSettingsPanel} from './components/stream-settings-panel';

export {default as XVIZPanel} from './components/declarative-ui/xviz-panel';
export {default as _XVIZMetric} from './components/declarative-ui/xviz-metric';
export {default as _XVIZPlot} from './components/declarative-ui/xviz-plot';
export {default as _XVIZTable} from './components/declarative-ui/xviz-table';
export {default as _XVIZVideo} from './components/declarative-ui/xviz-video';

export {default as _BaseWidget} from './components/hud/base-widget';
export {default as MeterWidget} from './components/hud/meter-widget';
export {default as TrafficLightWidget} from './components/hud/traffic-light-widget';
export {default as TurnSignalWidget} from './components/hud/turn-signal-widget';

// Assets
export {default as CarMesh} from './cars';

// Utils
export {mergeXVIZStyles} from './utils/style';

// Constants
export {COORDINATE, VIEW_MODE} from './constants';

export {default as _XVIZLoaderInterface} from './loaders/xviz-loader-interface';
export {default as XVIZStreamLoader} from './loaders/xviz-stream-loader';
export {default as XVIZLiveLoader} from './loaders/xviz-live-loader';
export {default as XVIZFileLoader} from './loaders/xviz-file-loader';
