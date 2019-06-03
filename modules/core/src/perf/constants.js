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
export const XVIZ_WORKERS_MONITOR_INTERVAL = 1000; // report interval in  ms.

export const HISTORY_SIZE = 16;

export const DEFAULT_STATS_TITLE = 'Streetscape Performance Metrics';

export const COLOR_PALETTE = {
  WHITE: '#FFFFFF',
  BLACK: '#141414',
  DARK_GREY: '#333333',
  LIGHT_GREY: '#B3B3B3',
  BLUE: '#5B91F4',
  LIGHT_BLUE: '#98baf9',
  GREEN: '#34a853',
  ORANGE: '#fbbc05',
  PURPLE: '#673ab7',
  RED: '#ea4335'
};

export const STATS_KEYS = {
  FPS: 'fps',
  REDRAW: 'framesRedrawn',
  FRAME_UPDATE: 'frame-update',
  LOADER_UPDATE: 'loader-update',
  LOADER_ERROR: 'loader-error'
};

export const STATS_NAMES = {
  [STATS_KEYS.FPS]: 'FPS',
  [STATS_KEYS.REDRAW]: 'Redraw',
  [STATS_KEYS.FRAME_UPDATE]: 'XVIZ Frames Rendered',
  [STATS_KEYS.LOADER_UPDATE]: 'XVIZ Frames Loaded',
  [STATS_KEYS.LOADER_ERROR]: 'XVIZ Loading Errors'
};

export const STATS_COLORS = {
  [STATS_KEYS.FPS]: COLOR_PALETTE.BLUE,
  [STATS_KEYS.REDRAW]: COLOR_PALETTE.GREEN,
  [STATS_KEYS.FRAME_UPDATE]: COLOR_PALETTE.ORANGE,
  [STATS_KEYS.LOADER_UPDATE]: COLOR_PALETTE.PURPLE,
  [STATS_KEYS.LOADER_ERROR]: COLOR_PALETTE.RED
};

export const STATS_HELP = {
  [STATS_KEYS.FPS]: 'Number of frames per seconds.',
  [STATS_KEYS.REDRAW]: 'Number of times WebGLContext was re-rendered.',
  [STATS_KEYS.FRAME_UPDATE]: 'Number of XVIZ frames rendered to screen.',
  [STATS_KEYS.LOADER_UPDATE]: 'Number of new XVIZ messages loaded.',
  [STATS_KEYS.LOADER_ERROR]: 'Number of XVIZ errors generated during loading.'
};

export const INITIAL_STATS = {counter: 0};
for (const statName of Object.values(STATS_KEYS)) {
  INITIAL_STATS[statName] = [{x: INITIAL_STATS.counter, y: 0}];
}

export const TOOLTIP_STYLE = {
  arrowSize: 0,
  borderWidth: 0,
  background: COLOR_PALETTE.BLACK,
  body: {
    maxWidth: null,
    color: COLOR_PALETTE.WHITE,
    whiteSpace: 'pre-wrap',
    fontSize: 14,
    borderRadius: 5
  }
};

export const STYLES = {
  LOG_VIEWER: {
    STATS: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      background: COLOR_PALETTE.WHITE
    },
    STATS_HELP: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    METRIC_CARD: {
      tooltip: TOOLTIP_STYLE
    }
  },
  WORKER_FARM: {
    CONTAINER: {
      margin: '10px 0'
    },
    TITLE: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    }
  },
  WORKERS: {
    CONTAINER: {
      margin: '10px 0'
    },
    TITLE: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    }
  },
  TAG: {
    marginLeft: 10,
    borderRadius: 20,
    padding: '2px 10px',
    border: 'solid 1.5px'
  },
  POSITIVE: {
    background: 'rgb(52, 168, 83, 0.1)',
    color: COLOR_PALETTE.GREEN,
    borderColor: COLOR_PALETTE.GREEN
  },
  NEGATIVE: {
    background: 'rgb(234, 67, 53, 0.1)',
    color: COLOR_PALETTE.RED,
    borderColor: COLOR_PALETTE.RED
  }
};
