# Use Alternative State Manager

Out of the box, the streetscape.gl React components are stateful. For example, when the user navigates around the 3D scene, the view state is stored inside the `LogViewer`. When the user clicks the "play" button, the timestamp is advanced automatically by the `PlaybackControl`.

In some advanced use cases, you may want to use an external state manager such as the state of a parent component, or [Redux](https://redux.js.org/)) to manage these states instead. It would enable the application to do things like:

- Synchronize the state of streetscape.gl components with non-streetscape.gl React components
- Intercept or override certain interaction states

## Example: Recenter Camera

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
        log={log}
        viewState={this.state.viewState}
        viewOffset={this.state.viewOffset}
        onViewStateChange={({viewState, viewOffset}) => this.setState({viewState, viewOffset})}
      />;
    );
  }
}
```

## Example: Highlight Objects

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
      log={log}
      xvizStyle={CUSTOM_XVIZ_STYLE}
      objectStates={this.state.objectStates}
      onViewStateChange={objectStates => this.setState({objectStates})}
    />;
  );
}
```
