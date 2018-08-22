import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XVIZLoaderInterface from '../loaders/xviz-loader-interface';

export default function connectToLog({getLogState, Component}) {
  class WrappedComponent extends PureComponent {
    static propTypes = {
      log: PropTypes.instanceOf(XVIZLoaderInterface).isRequired
    };

    state = {
      lastUpdate: 0
    };

    componentDidMount() {
      this.props.log.on('update', this._update);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.log !== nextProps.log) {
        this.props.log.off('update', this._update);
        nextProps.log.on('update', this._update);
      }
    }

    componentWillUnmount() {
      this.props.log.off('update', this._update);
    }

    _update = () => {
      this.setState({lastUpdate: Date.now()});
    };

    render() {
      const {log, ...otherProps} = this.props;

      const logState = getLogState(log);

      return <Component {...otherProps} {...logState} log={log} />;
    }
  }

  return WrappedComponent;
}
