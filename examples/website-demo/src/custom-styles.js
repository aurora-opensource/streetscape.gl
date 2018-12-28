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

export const UI_THEME = {
  extends: 'dark',
  background: 'rgba(51,51,51,0.9)',
  backgroundAlt: '#222222',

  controlColorPrimary: '#858586',
  controlColorSecondary: '#636364',
  controlColorDisabled: '#404042',
  controlColorHovered: '#F8F8F9',
  controlColorActive: '#5B91F4',

  textColorPrimary: '#F8F8F9',
  textColorSecondary: '#D0D0D1',
  textColorDisabled: '#717172',
  textColorInvert: '#1B1B1C',

  fontFamily: 'ff-clan-web-pro, "Helvetica Neue", Helvetica, sans-serif',
  fontSize: 11,
  shadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)'
};

export const PLAYBACK_CONTROL_STYLE = {
  wrapper: {
    paddingTop: 44
  },
  slider: {
    track: {
      height: 8,
      background: '#4b4b4b',
      borderRadius: 4
    },
    knobSize: 24,
    trackFill: {
      display: 'none'
    },
    knob: props => ({
      width: 2,
      borderRadius: 0,
      borderColor: props.theme.controlColorActive,
      marginLeft: -1,
      borderWidth: 1
    })
  },
  tick: {
    color: '#D0D0D1'
  },
  buffer: {
    background: '#111',
    borderRadius: 4
  },
  lookAheadSlider: {
    knobSize: 8,
    track: {
      height: 4,
      background: '#111',
      borderRadius: 2
    },
    trackFill: {
      background: '#858586',
      borderRadius: 2
    },
    knob: {
      borderWidth: 4
    }
  },
  lookAheadMarker: props => ({
    borderTopColor: props.theme.controlColorActive
  }),
  playPauseButton: {
    width: 24,
    height: 24,
    marginLeft: 12,
    marginBottom: 4
  },
  controls: {
    borderTop: 'solid 1px #404042',
    marginTop: 4,
    padding: '12px 24px'
  },
  timestamp: {
    color: '#fff',
    position: 'absolute',
    fontSize: 12,
    left: 12,
    top: 12
  }
};

export const TOOLTIP_STYLE = {
  arrowSize: 0,
  borderWidth: 0,
  background: 'rgba(0,0,0,0.9)'
};

export const BUTTON_STYLE = {
  size: 48,
  wrapper: {
    fontSize: 20
  }
};

const PRIMITIVE_TYPE_TO_ICON = {
  point: '\\e90c',
  circle: '\\e907',
  image: '\\e90a',
  polyline: '\\e90e',
  polygon: '\\e90d',
  float: '\\e917',
  text: '\\e913',
  group: '\\e909'
};

export const STREAM_SETTINGS_STYLE = {
  checkbox: {
    wrapper: props => ({
      width: '100%',
      position: 'relative',
      opacity: props.value === 'off' ? 0.4 : 1
    }),
    border: props => ({
      display: props.isHovered ? 'block' : 'none',
      position: 'absolute',
      borderStyle: 'none',
      right: 0,
      marginRight: 0
    }),
    icon: props => ({
      fontFamily: 'streetscape',
      fontSize: 16,
      color: props.theme.controlColorPrimary
    }),
    iconOn: '\ue91c',
    iconOff: '\ue900',
    iconIndeterminate: '\ue91c'
  },
  badge: props => ({
    order: -1,
    '&:before':
      props.type in PRIMITIVE_TYPE_TO_ICON
        ? {
            fontFamily: 'streetscape',
            fontSize: 14,
            paddingRight: 12,
            content: `"${PRIMITIVE_TYPE_TO_ICON[props.type]}"`
          }
        : {
            content: '""'
          }
  })
};

export const LOG_VIEWER_STYLE = {
  objectLabelColor: '#D0D0D1',
  objectLabelTipSize: props => (props.isSelected ? 30 : 8),
  objectLabelTip: props => (props.isSelected ? null : {display: 'none'}),
  objectLabelLine: props => (props.isSelected ? null : {display: 'none'}),
  objectLabelBody: props => ({
    borderRadius: 12,
    padding: 8,
    color: '#222',
    background: props.isSelected ? '#F8F8F9' : '#D0D0D1'
  }),

  tooltip: {
    background: 'rgba(0,0,0,0.9)',
    '>div': {
      marginTop: 4
    }
  }
};

export const FLOAT_PANEL_STYLE = {
  wrapper: {
    zIndex: 9999
  }
};

export const XVIZ_PANEL_STYLE = {
  metric: {
    title: {
      textAlign: 'left',
      fontSize: 12,
      fontWeight: 500
    },
    tooltip: TOOLTIP_STYLE
  },
  video: {
    wrapper: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      paddingTop: 26
    },
    selector: {
      wrapper: {
        position: 'absolute',
        width: 140,
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)'
      },
      border: {
        border: 'none'
      }
    }
  }
};
