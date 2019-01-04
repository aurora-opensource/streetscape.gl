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

  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  fontSize: 14,
  fontWeight: 200,

  shadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)'
};

export const PLAYBACK_CONTROL_STYLE = {
  wrapper: {
    paddingTop: 44
  },
  slider: {
    wrapper: {
      background: 'none'
    },
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
    left: 12,
    top: 12
  }
};

export const TOOLTIP_STYLE = {
  arrowSize: 0,
  borderWidth: 0,
  background: '#CCCCCC',
  body: {
    color: '#141414',
    whiteSpace: 'nowrap',
    fontSize: 12
  }
};

export const TOOLBAR_BUTTON_STYLE = {
  size: 60,
  wrapper: props => ({
    fontSize: 32,
    background: props.isHovered ? 'rgba(129,133,138,0.3)' : props.theme.background
  })
};

export const TOOLBAR_MENU_STYLE = {
  arrowSize: 0,
  borderWidth: 0,
  body: {
    left: 56,
    boxShadow: 'none'
  }
};

export const HELP_BUTTON_STYLE = {
  size: 20,
  wrapper: {
    background: 'none'
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
      display: props.isHovered || props.value === 'off' ? 'block' : 'none',
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
            fontSize: 16,
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
  objectLabelBody: props => {
    const {object, stylesheet, isSelected} = props;

    let background = '#F8F8F9';
    let color = '#222';
    if (!isSelected) {
      const strokeColor = stylesheet.getProperty('stroke_color', object);
      if (strokeColor) {
        background = `rgb(${strokeColor.slice(0, 3).join(',')})`;
        const brightness = (strokeColor[0] + strokeColor[1] + strokeColor[2]) / 3;
        color = brightness < 170 ? '#fff' : color;
      }
    }
    return {
      borderRadius: 12,
      padding: '4px 8px',
      fontSize: isSelected ? 12 : 14,
      color,
      background
    };
  },

  tooltip: {
    maxWidth: 276,
    fontSize: 12,
    background: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    '>hr': {
      width: '100%',
      float: 'left',
      margin: '12px -12px',
      padding: '0 12px',
      opacity: 0.2
    },
    ' b': {
      textTransform: 'capitalize',
      fontSize: 14
    },
    '>div': {
      minWidth: '50%',
      float: 'left',
      margin: '2px 0'
    }
  }
};

/* eslint-disable camelcase */
export const XVIZ_STYLE = {
  '/tracklets/objects': [
    {name: 'selected', style: {fill_color: '#ff800088', stroke_color: '#ff8000'}}
  ]
};
/* eslint-enable camelcase */

export const FLOAT_PANEL_STYLE = {
  wrapper: {
    zIndex: 9999
  }
};

export const XVIZ_PANEL_STYLE = {
  metric: {
    title: {
      textAlign: 'left',
      fontSize: 14,
      fontWeight: 500
    },
    tooltip: TOOLTIP_STYLE
  },
  video: {
    wrapper: {
      cursor: 'grab',
      position: 'absolute',
      width: '100%',
      height: '100%',
      paddingTop: 28
    },
    selector: {
      wrapper: {
        position: 'absolute',
        width: 160,
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)'
      },
      select: {
        fontSize: 14
      },
      border: {
        border: 'none'
      }
    }
  }
};
