export const UI_THEME = {
  extends: 'dark',
  background: 'rgba(16,16,16,0.9)',
  backgroundAlt: '#222222',

  controlColorPrimary: '#858586',
  controlColorSecondary: '#636364',
  controlColorDisabled: '#404042',
  controlColorHovered: '#F8F8F9',
  controlColorActive: '#11939A',

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
    padding: 12
  },
  timestamp: {
    position: 'absolute',
    left: 0,
    top: -36,
    background: 'rgba(16,16,16,0.9)',
    padding: '8px 12px'
  }
};

export const TOOLTIP_STYLE = {
  arrowSize: 0,
  borderWidth: 0,
  background: '#222'
};

const PRIMITIVE_TYPE_TO_ICON = {
  point: 'grain',
  circle: 'scatter_plot',
  image: 'photo',
  polyline: 'show_chart',
  polygon: 'panorama_fish_eye',
  float: 'looks_two',
  text: 'text_fields'
};

export const STREAM_SETTINGS_STYLE = {
  checkbox: {
    wrapper: props => ({
      width: '100%',
      opacity: props.value === 'off' ? 0.4 : 1
    }),
    border: {
      borderStyle: 'none',
      marginRight: 0
    },
    icon: props => ({
      fontFamily: 'Material Icons',
      fontSize: 16,
      color: props.value === 'on' ? props.theme.controlColorActive : props.theme.controlColorPrimary
    }),
    iconOn: 'visibility',
    iconOff: 'visibility_off',
    iconIndeterminate: 'visibility'
  },
  badge: props => ({
    order: -1,
    '&:before':
      props.type in PRIMITIVE_TYPE_TO_ICON
        ? {
            fontFamily: 'Material Icons',
            fontSize: 16,
            paddingRight: 12,
            content: `"${PRIMITIVE_TYPE_TO_ICON[props.type]}"`
          }
        : {
            content: '""'
          }
  })
};

export const PANEL_STYLE = {
  metric: {
    title: {
      fontSize: 12,
      fontWeight: 600
    },
    tooltip: TOOLTIP_STYLE
  },
  video: {
    selector: {
      wrapper: {
        position: 'absolute',
        top: 0,
        left: 0
      }
    }
  }
};
