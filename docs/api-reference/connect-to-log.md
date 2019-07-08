# connectToLog

Wraps a React component in a
[higher-order component](https://reactjs.org/docs/higher-order-components.html) that rerenders when
a [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) updates.

```jsx
// some-container.js
import React from 'react';
import {connectToLog} from 'streetscape.gl';

class SomeComponent extends React.PureComponent {
  render() {
    const {timestamp, frame} = this.props;
    // do something
  }
}

const getLogState = (log, ownProps) => ({
  timestamp: log.getCurrentTime(),
  frame: log.getCurrentFrame()
});

const SomeContainer = connectToLog({Component: SomeComponent, getLogState});
export default SomeContainer;
```

```js
// app.js
import SomeContainer from './some-container';

<SomeContainer log={log} />;
```

Arguments:

- `opts` (Object)
  - `Component` (React.Component) - the component class to wrap
  - `getLogState` (Function) - a callback used to retrieve props from the connected log. Receives
    two arguments: `log` (XVIZLoader) and `ownProps` (Object, other props that are passed to the
    rendered instance).
