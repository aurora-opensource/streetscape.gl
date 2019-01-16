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
