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

// streetscape.gl custom layers
export {default as SignLayer} from './layers/sign-layer/sign-layer';
export {default as TrafficLightLayer} from './layers/traffic-light-layer/traffic-light-layer';
export {default as ImageryLayer} from './layers/imagery-layer/imagery-layer';

// Generic layers (should be moved back to deck.gl)
export {default as BitmapLayer} from './layers/bitmap-layer/bitmap-layer';
export {default as MeshLayer} from './layers/mesh-layer/mesh-layer';

// COMPONENTS

export {default as connectToLog} from './components/connect';

export {default as LogViewer} from './components/log-viewer';
export {default as PlaybackControl} from './components/playback-control';
export {default as PerspectivePopup} from './components/log-viewer/perspective-popup';
export {default as StreamSettingsPanel} from './components/stream-settings-panel';

export {default as XVIZPanel} from './components/declarative-ui/xviz-panel';

export {XVIZPanelComponent} from './components/declarative-ui/xviz-panel';
export {XVIZMetricComponent} from './components/declarative-ui/xviz-metric';
export {XVIZPlotComponent} from './components/declarative-ui/xviz-plot';
export {XVIZTableComponent} from './components/declarative-ui/xviz-table';
export {XVIZVideoComponent} from './components/declarative-ui/xviz-video';

export {default as BaseWidget} from './components/hud/base-widget';
export {default as MeterWidget} from './components/hud/meter-widget';
export {default as TrafficLightWidget} from './components/hud/traffic-light-widget';
export {default as TurnSignalWidget} from './components/hud/turn-signal-widget';

// Constants
export * from './constants';

export * from './layers/layer-utils';

export {default as XVIZStreamLoader} from './loaders/xviz-stream-loader';
export {default as XVIZFileLoader} from './loaders/xviz-file-loader';
