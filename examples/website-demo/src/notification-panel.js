import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

const PANEL_STYLE = {
  display: 'flex',
  color: 'white',
  background: '#5B91F4',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '2px',
  position: 'absolute',
  zIndex: '10000',
  boxSizing: 'border-box'
};

export default class NotificationPanel extends PureComponent {
  static propTypes = {
    notification: PropTypes.object.isRequired
  };

  render() {
    return <div style={PANEL_STYLE}>{this.props.notification.message}</div>;
  }
}
