# Use Alternative State Manager

Out of the box, the streetscape.gl React components are stateful. For example, when the user
navigates around the 3D scene, the view state is stored inside the `LogViewer`. When the user clicks
the "play" button, the timestamp is advanced automatically by the `PlaybackControl`.

In some advanced use cases, you may want to use an external state manager such as the state of a
parent component, or [Redux](https://redux.js.org/)) to manage these states instead. It would enable
the application to do things like:

- Synchronize the state of streetscape.gl components with non-streetscape.gl React components
- Intercept or override certain interaction states

## Example: Recenter Camera

This example shows how an app can programatically reset the camera.

```jsx
import React from 'react';
import {LogViewer} from 'streetscape.gl';

class MapView extends React.PureComponent {
  state = {
    viewState: null,
    viewOffset: null
  };

  // Call this method to recenter camera
  recenterCamera() {
    this.setState({
      viewOffset: {x: 0, y: 0, bearing: 0}
    });
  }

  render() {
    return (
      <LogViewer
        log={this.props.log}
        viewState={this.state.viewState}
        viewOffset={this.state.viewOffset}
        onViewStateChange={({viewState, viewOffset}) => this.setState({viewState, viewOffset})}
      />;
    );
  }
}
```

## Example: Highlight Objects

This example shows how an app can programatically change the appearance of XVIZ geometries.

```jsx
import React from 'react';
import {LogViewer} from 'streetscape.gl';

// Inject custom styling for the /objects stream
export const CUSTOM_XVIZ_STYLE = {
  '/objects': [{name: 'highlighted', style: {fill_color: '#ff8000aa'}}]
};

class MapView extends React.PureComponent {
  this.state = {
    objectStates: {}
  };

  // Call this method to turn highlight on/off
  highlightObject(id, value = true) {
    const oldObjectStates = this.state.objectStates;
    this.setState({
      objectStates: {
        ...oldObjectStates,
        highlighted: {
          ...oldObjectStates.highlighted,
          [id]: value
        }
      }
    });
  }

  render (
    <LogViewer
      log={this.props.log}
      xvizStyle={CUSTOM_XVIZ_STYLE}
      objectStates={this.state.objectStates}
      onViewStateChange={objectStates => this.setState({objectStates})}
    />;
  );
}
```

## Example: Loop Part of the Timeline

This example shows how an app can add custom looping to the playback control.

```jsx
import React from 'react';
import {PlaybackControl} from 'streetscape.gl';

class CustomPlaybackControl extends React.PureComponent {
  _onSeek(timestamp) {
    const {log, loopStart, loopEnd} = this.props;
    // Do not play beyond the designated range
    if (timestamp > loopEnd) {
      timestamp = loopStart;
    }
    // Pass the new timestamp to the log
    log.seek(timestamp);
    // Prevent the default behavior
    return true;
  }

  render() {
    return (
      <PlaybackControl
        log={this.props.log}
        onSeek={this._onSeek}
      />;
    );
  }
}
```
