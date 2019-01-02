import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {evaluateStyle, withTheme} from '@streetscape.gl/monochrome';
import styled from '@emotion/styled';

import connectToLog from '../connect';

const WrapperComponent = styled.div(props => ({
  ...props.theme.__reset__,
  padding: props.theme.spacingSmall,
  display: 'inline-block',
  ...evaluateStyle(props.userStyle, props)
}));

class BaseWidget extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    streamNames: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,

    // From connected log
    streamMetadata: PropTypes.object,
    frame: PropTypes.object
  };

  static defaultProps = {
    style: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      streams: this._extractStreams(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.streamNames !== this.props.streamNames ||
      nextProps.streamMetadata !== this.props.streamMetadata ||
      nextProps.frame !== this.props.frame
    ) {
      this.setState({streams: this._extractStreams(nextProps)});
    }
  }

  _extractStreams({streamNames, streamMetadata, frame}) {
    const result = {};
    for (const key in streamNames) {
      const streamName = streamNames[key];
      if (streamName) {
        result[key] = {
          ...(streamMetadata && streamMetadata[streamName]),
          data: frame && frame.streams[streamName]
        };
      }
    }
    return result;
  }

  render() {
    const {theme, style, children} = this.props;
    const {streams} = this.state;

    return (
      <WrapperComponent theme={theme} userStyle={style.wrapper}>
        {children({theme, streams})}
      </WrapperComponent>
    );
  }
}

const getLogState = (log, {streamName}) => {
  const metadata = log.getMetadata();
  return {
    streamMetadata: metadata && metadata.streams,
    frame: log.getCurrentFrame()
  };
};

export default connectToLog({getLogState, Component: withTheme(BaseWidget)});
