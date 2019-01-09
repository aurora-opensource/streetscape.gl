/* global document */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig} from '@xviz/parser';
import {LogViewer, PlaybackControl} from 'streetscape.gl';

import XVIZJsonLoader from './xviz-json-loader';
import Editor from './editor';

import {XVIZ_CONFIG, MAPBOX_TOKEN, MAP_STYLE} from './constants';

setXVIZConfig(XVIZ_CONFIG);

class Example extends PureComponent {
  _log = new XVIZJsonLoader();

  render() {
    const log = this._log;

    return (
      <div id="container">
        <Editor log={log} />
        <div id="map-view">
          <LogViewer log={log} mapboxApiAccessToken={MAPBOX_TOKEN} mapStyle={MAP_STYLE} />
          <div id="timeline">
            <PlaybackControl width="100%" log={log} formatTimestamp={x => x.toFixed(2)} />
          </div>
        </div>
      </div>
    );
  }
}

render(<Example />, document.getElementById('app'));
