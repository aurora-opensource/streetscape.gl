import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XVIZLoaderInterface from '../loaders/xviz-loader-interface';

export default function connectToLog({getLogState, Component}) {
  class WrappedComponent extends PureComponent {
    static propTypes = {
      log: PropTypes.instanceOf(XVIZLoaderInterface)
    };

    state = {
      logVersion: -1
    };

    componentDidMount() {
      const {log} = this.props;
      if (log) {
        log.subscribe(this._update);
      }
    }

    componentWillReceiveProps(nextProps) {
      const {log} = this.props;
      const nextLog = nextProps.log;
      if (log !== nextLog) {
        if (log) {
          log.unsubscribe(this._update);
        }
        if (nextLog) {
          nextLog.subscribe(this._update);
        }
      }
    }

    componentWillUnmount() {
      const {log} = this.props;
      if (log) {
        log.unsubscribe(this._update);
      }
    }

    _update = logVersion => {
      this.setState({logVersion});
    };

    render() {
      const {log, ...otherProps} = this.props;

      const logState = log && getLogState(log, otherProps);

      return <Component {...otherProps} {...logState} log={log} />;
    }
  }

  return WrappedComponent;
}
