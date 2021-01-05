// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Form, CheckBox, evaluateStyle} from '@streetscape.gl/monochrome';
import styled from '@emotion/styled';

import connectToLog from './connect';

const Badge = styled.div(props => ({
  '&:before': {
    content: `"${props.type || ''}"`
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
  const {style = {}, collapsible = false} = opts;

  for (const streamName in metadata) {
    const parentKey = getParentKey(streamName);
    let siblings = root;

    if (parentKey) {
      root[parentKey] = root[parentKey] || {
        type: 'checkbox',
        children: {},
        collapsible,
        badge: (
          <Badge
            userStyle={style.badge}
            type={
              (metadata[streamName] && metadata[streamName].primitive_type) ||
              metadata[streamName].scalar_type
            }
          />
        )
      };
      siblings = root[parentKey].children;
    }

    if (!siblings[streamName]) {
      siblings[streamName] = {
        type: 'checkbox',
        title: streamName.replace(parentKey, ''),
        children: {},
        badge: (
          <Badge
            userStyle={style.badge}
            type={metadata[streamName].primitive_type || metadata[streamName].scalar_type}
          />
        )
      };
    }
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
    streamsMetadata: PropTypes.object,
    onSettingsChange: PropTypes.func
  };

  static defaultProps = {
    style: {},
    onSettingsChange: () => {}
  };

  constructor(props) {
    super(props);

    const data = createFormData(props.streamsMetadata, props);
    const values = settingsToFormValues(data, props.streamSettings);
    this.state = {data, values};
  }

  componentWillReceiveProps(nextProps) {
    let {data, values} = this.state;

    if (nextProps.streamsMetadata !== this.props.streamsMetadata) {
      data = createFormData(nextProps.streamsMetadata, nextProps);
      values = null;
    }
    if (nextProps.streamSettings !== this.props.streamSettings) {
      values = settingsToFormValues(data, nextProps.streamSettings);
    }
    this.setState({data, values});
  }

  _onValuesChange = newValues => {
    const {streamsMetadata, log, onSettingsChange} = this.props;
    const {data} = this.state;
    const values = updateFormValues(data, this.state.values, newValues);
    const settings = formValuesToSettings(streamsMetadata, values);

    if (!onSettingsChange(settings) && log) {
      log.updateStreamSettings(settings);
    }
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

const getLogState = log => ({
  streamsMetadata: log.getStreamsMetadata(),
  streamSettings: log.getStreamSettings()
});

export default connectToLog({getLogState, Component: StreamSettingsPanel});
