# Display Multiple Logs

The most common usage of streetscape.gl components involves a single log. However, some use cases
call for the synchronized playback of multiple logs, for the purpose of comparison. This article
discusses some techniques to get it working.

## Loading Multiple Logs

The loaders, the `LogViewer` and `XVIZPanel` components are perfectly encapsulated and work along
side each other. For example:

```jsx
import React from 'react';
import {XVIZStreamLoader, LogViewer} from 'streetscape.gl';

const logA = new XVIZStreamLoader({
  logGuid: 'log-A',
  serverConfig: {serverUrl: 'ws://localhost:8081'}
});
const logB = new XVIZStreamLoader({
  logGuid: 'log-B',
  serverConfig: {serverUrl: 'ws://localhost:8081'}
});

class App extends React.Component {
  render() {
    // Display two log viewers side by side
    return (
      <div style={{display: 'flex', width: '100%'}}>
        <div>
          <LogViewer log={logA} />
        </div>
        <div>
          <LogViewer log={logB} />
        </div>
      </div>
    );
  }
}
```

## Synchronized Cameras

At this point, the cameras in the two log viewers can be manipulated independently. We may make them
match each other by overriding their internal view states:

```jsx
class App extends React.Component {
  state = {
    viewState: null,
    viewOffset: null
  };

  _onViewStateChange({viewState, viewOffset}) {
    this.setState({viewState, viewOffset});
  }

  render() {
    // Display two log viewers side by side
    return (
      <div style={{display: 'flex', width: '100%'}}>
        <div>
          <LogViewer
            log={logA}
            viewState={this.state.viewState}
            viewOffset={this.state.viewOffset}
            onViewStateChange={this._onViewStateChange}
          />
        </div>
        <div>
          <LogViewer
            log={logB}
            viewState={this.state.viewState}
            viewOffset={this.state.viewOffset}
            onViewStateChange={this._onViewStateChange}
          />
        </div>
      </div>
    );
  }
}
```

## Synchronized Playback

By default, the `PlaybackControl` and `StreamSettingsPanel` components only handles one log. To
synchronize the time and settings between the two logs, we need to listen to their changes and
update both logs:

```jsx
import {PlaybackControl, StreamSettingsPanel} from 'streetscape.gl';

class App extends React.Component {
  _onSeek(timestamp) {
    logA.seek(timestamp);
    logB.seek(timestamp);
  }
  _onLookAheadChange(lookAhead) {
    logA.setLookAhead(lookAhead);
    logB.setLookAhead(lookAhead);
  }
  _onSettingsChange(settings) {
    logA.updateStreamSettings(settings);
    logB.updateStreamSettings(settings);
  }

  render() {
    // Display two log viewers side by side
    return (
      <div>
        <div style={{display: 'flex', width: '100%'}}>
          <div>
            <LogViewer log={logA} />
          </div>
          <div>
            <LogViewer log={logB} />
          </div>
        </div>
        <PlaybackControl
          log={logA}
          onSeek={this._onSeek}
          onLookAheadChange={this._onLookAheadChange}
        />
        <StreamSettingsPanel log={logA} onSettingsChange={this._onSettingsChange} />
      </div>
    );
  }
}
```
