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

import {LogViewer, VIEW_MODE} from 'streetscape.gl';

import {MAPBOX_TOKEN, MAP_STYLE, CAR} from './constants';
import {XVIZ_STYLE, LOG_VIEWER_STYLE} from './custom-styles';

const OBJECT_ICONS = {
  Car: 'car',
  Van: 'bus',
  Pedestrian: 'pedestrian',
  Cyclist: 'bike'
};

const renderObjectLabel = ({id, object, isSelected}) => {
  const feature = object.getFeature('/tracklets/objects');

  if (!feature) {
    return isSelected && <b>{id}</b>;
  }

  const {classes} = feature.base;

  if (isSelected) {
    return (
      <div>
        <div>
          <b>{id}</b>
        </div>
        <div>{classes.join(' ')}</div>
      </div>
    );
  }

  const objectType = classes && classes.join('');
  if (objectType in OBJECT_ICONS) {
    return (
      <div>
        <i className={`icon-${OBJECT_ICONS[objectType]}`} />
      </div>
    );
  }

  return null;
};

export default class MapView extends PureComponent {
  _onViewStateChange = ({viewOffset}) => {
    this.props.onSettingsChange({viewOffset});
  };

  render() {
    const {log, settings} = this.props;

    return (
      <LogViewer
        log={log}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        car={CAR}
        xvizStyles={XVIZ_STYLE}
        style={LOG_VIEWER_STYLE}
        showTooltip={settings.showTooltip}
        viewMode={VIEW_MODE[settings.viewMode]}
        viewOffset={settings.viewOffset}
        onViewStateChange={this._onViewStateChange}
        renderObjectLabel={renderObjectLabel}
      />
    );
  }
}
