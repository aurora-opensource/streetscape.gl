import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XVIZLoaderInterface from '../loaders/xviz-loader-interface';

export default function connectToLog({getLogState, Component}) {
  class WrappedComponent extends PureComponent {
    static propTypes = {
      log: PropTypes.instanceOf(XVIZLoaderInterface).isRequired
    };

    state = {
      logVersion: -1
    };

    componentDidMount() {
      this.props.log.subscribe(this._update);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.log !== nextProps.log) {
        this.props.log.unsubscribe(this._update);
        nextProps.log.subscribe(this._update);
      }
    }

    componentWillUnmount() {
      this.props.log.unsubscribe(this._update);
    }

    _update = logVersion => {
      this.setState({logVersion});
    };

    render() {
      const {log, ...otherProps} = this.props;

      const logState = getLogState(log, otherProps);

      return <Component {...otherProps} {...logState} log={log} />;
    }
  }

  return WrappedComponent;
}
