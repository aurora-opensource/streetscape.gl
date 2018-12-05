import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Form, CheckBox, evaluateStyle} from '@streetscape.gl/monochrome';
import styled from '@emotion/styled';

import connectToLog from './connect';

const Badge = styled.div(props => ({
  '&:before': {
    content: `"${props.type}"`
  },
  ...evaluateStyle(props.userStyle, props)
}));

function getParentKey(streamName) {
  const i = streamName.indexOf('/', 1);
  if (i > 1) {
    return streamName.slice(0, i);
  }
  return '';
}

function getParentValue(children, values) {
  let parentValue = null;
  for (const key in children) {
    const value = values[key];
    if (parentValue === null) {
      parentValue = value;
    } else if (parentValue !== value) {
      return CheckBox.INDETERMINATE;
    }
  }
  return parentValue;
}

// Created 1-level nested form structure
export function createFormData(metadata, opts) {
  if (!metadata) {
    return null;
  }

  const root = {};
  const {style = {}} = opts;

  for (const streamName in metadata) {
    const parentKey = getParentKey(streamName);
    let siblings = root;

    if (parentKey) {
      root[parentKey] = root[parentKey] || {
        type: 'checkbox',
        children: {},
        badge: <Badge userStyle={style.badge} />
      };
      siblings = root[parentKey].children;
    }

    siblings[streamName] = {
      type: 'checkbox',
      title: streamName.replace(parentKey, ''),
      badge: (
        <Badge
          userStyle={style.badge}
          type={metadata[streamName].primitive_type || metadata[streamName].scalar_type}
        />
      )
    };
  }

  return root;
}

export function settingsToFormValues(data, settings) {
  if (!data || !settings) {
    return null;
  }

  const values = {};
  for (const key in data) {
    const {children} = data[key];
    if (children) {
      // is parent
      for (const streamName in children) {
        values[streamName] = settings[streamName] ? CheckBox.ON : CheckBox.OFF;
      }
      values[key] = getParentValue(children, values);
    } else {
      // is leaf
      values[key] = settings[key] ? CheckBox.ON : CheckBox.OFF;
    }
  }
  return values;
}

export function updateFormValues(data, oldValues, newValues) {
  const values = {...oldValues, ...newValues};
  for (const key in newValues) {
    if (data[key] && data[key].children) {
      // is parent, reset child values
      for (const streamName in data[key].children) {
        values[streamName] = newValues[key];
      }
    } else {
      // is leaf, re-evaluate parent value
      const parentKey = getParentKey(key);
      if (parentKey) {
        values[parentKey] = getParentValue(data[parentKey].children, values);
      }
    }
  }
  return values;
}

export function formValuesToSettings(metadata, values) {
  const settings = {};
  for (const streamName in metadata) {
    settings[streamName] = values[streamName] === CheckBox.ON;
  }
  return settings;
}

class StreamSettingsPanel extends PureComponent {
  static propTypes = {
    style: PropTypes.object,
    streamMetadata: PropTypes.object,
    onSettingsChange: PropTypes.func
  };

  static defaultProps = {
    style: {},
    onSettingsChange: () => {}
  };

  constructor(props) {
    super(props);

    const data = createFormData(props.streamMetadata, props);
    const values = settingsToFormValues(data, props.streamSettings);
    this.state = {data, values};
  }

  componentWillReceiveProps(nextProps) {
    let {data, values} = this.state;

    if (nextProps.streamMetadata !== this.props.streamMetadata) {
      data = createFormData(nextProps.streamMetadata, nextProps);
      values = null;
    }
    if (nextProps.streamSettings !== this.props.streamSettings) {
      values = settingsToFormValues(data, nextProps.streamSettings);
    }
    this.setState({data, values});
  }

  _onValuesChange = newValues => {
    const {streamMetadata, log, onSettingsChange} = this.props;
    const {data} = this.state;
    const values = updateFormValues(data, this.state.values, newValues);
    const settings = formValuesToSettings(streamMetadata, values);

    log.updateStreamSettings(settings);
    onSettingsChange(settings);
  };

  render() {
    const {style} = this.props;
    const {data, values} = this.state;

    if (!data || !values) {
      return null;
    }

    return <Form style={style} data={data} values={values} onChange={this._onValuesChange} />;
  }
}

const getLogState = log => {
  const metadata = log.getMetadata();
  return {
    streamMetadata: metadata && metadata.streams,
    streamSettings: log.getStreamSettings()
  };
};

export default connectToLog({getLogState, Component: StreamSettingsPanel});
