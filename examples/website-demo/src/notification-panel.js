import React, {Component} from 'react';
import PropTypes from 'prop-types';

const PANEL_STYLE = {
  display: 'flex',
  color: 'white',
  background: '#5B91F4',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  padding: '2px',
  overflowY: 'scroll',
  overflowX: 'hidden',
  position: 'absolute',
  zIndex: '10000',
  boxSizing: 'border-box'
};

const PANEL_ITEM_STYLE = {
  display: 'flex',
  alignItems: 'center'
};

const MESSAGE_STYLE = {
  marginRight: '2px'
};

export default class NotificationPanel extends Component {
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.object).isRequired
  };

  render() {
    return (
      <div style={PANEL_STYLE}>
        {this.props.notifications.map((n, i) => (
          <div key={n.id} style={PANEL_ITEM_STYLE}>
            <div style={MESSAGE_STYLE}>{n.message}</div>
          </div>
        ))}
      </div>
    );
  }
}
