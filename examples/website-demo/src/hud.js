import React, {PureComponent} from 'react';
import {BaseWidget, TurnSignalWidget, MeterWidget} from 'streetscape.gl';

const WHEEL_WIDGET_STYLE = {
  arcRadius: 0,
  units: {
    fontSize: 12
  }
};
const METER_WIDGET_STYLE = {
  arcRadius: 42,
  msrValue: {
    paddingTop: 8
  },
  units: {
    fontSize: 12
  }
};
const TURN_SIGNAL_WIDGET_STYLE = {
  wrapper: {
    padding: 0
  },
  arrow: {
    height: 16
  }
};
const AUTONOMY_STATE = {
  autonomous: '#47B275',
  manual: '#5B91F4',
  error: '#F25138',
  unknown: '#E2E2E2'
};

export default class HUD extends PureComponent {
  _renderAutonomyState({streams}) {
    // TODO - change fallback to 'unknown' when the stream is available
    const state = streams.state.variable || 'autonomous';
    return (
      <div className="autonomy-state" style={{background: AUTONOMY_STATE[state]}}>
        {state}
      </div>
    );
  }

  render() {
    const {log} = this.props;

    return (
      <div id="hud">
        <div className="hud-column">
          <BaseWidget log={log} streamNames={{state: '/vehicle/autonomy_state'}}>
            {this._renderAutonomyState}
          </BaseWidget>
          <TurnSignalWidget
            log={log}
            style={TURN_SIGNAL_WIDGET_STYLE}
            streamName="/vehicle/turn_signal"
          />
          <MeterWidget
            log={log}
            style={WHEEL_WIDGET_STYLE}
            streamName="/vehicle/wheel_angle"
            units="Wheel"
            min={-360}
            max={360}
          />
        </div>
        <MeterWidget
          log={log}
          style={METER_WIDGET_STYLE}
          streamName="/vehicle/acceleration"
          units="Acceleration"
          min={-4}
          max={4}
        />
        <MeterWidget
          log={log}
          style={METER_WIDGET_STYLE}
          streamName="/vehicle/velocity"
          units="Speed"
          min={0}
          max={20}
        />
      </div>
    );
  }
}
