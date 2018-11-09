import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

export default class XVIZContainer extends PureComponent {
  static propTypes = {
    layout: PropTypes.string
  };

  static defaultProps = {
    layout: 'vertical'
  };

  render() {
    const {layout} = this.props;

    const layoutStyle = {
      display: 'flex',
      width: '100%'
    };
    const childStyle = {};

    switch (layout) {
      case 'vertical':
        layoutStyle.flexDirection = 'column';
        childStyle.flex = '0 0 auto';
        break;

      case 'horizontal':
        layoutStyle.flexDirection = 'row';
        childStyle.flex = '1 1 auto';
        break;

      default:
        // Unknown layout type
        return null;
    }

    return (
      <div className="xviz-container" style={layoutStyle}>
        {React.Children.map(this.props.children, child => (
          <div style={childStyle}>{child}</div>
        ))}
      </div>
    );
  }
}
