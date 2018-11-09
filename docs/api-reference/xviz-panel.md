# XVIZPanel (React Component)

*Uber Confidential Information*


Renders a XVIZ panel from a [Declarative UI]() definition.

```jsx
import {XVIZPanel} from 'streetscape.gl';

<XVIZPanel log={log} id="00000000-0000-0000-0000-000000000000" />

```

## Properties

##### `log` (`XVIZLoader`)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### `id` (String)

The identifier of the panel to render. The definition for this panel must be supplied via the metadata of the log.

##### `style` (Object, optional)

CSS style of the panel container.

#### `components` (Object, optional)

Supply custom renderers for XVIZ Declarative UI components. Key is declarative UI component types and value is a `React.Component`.

```js
// Support an additional component type `text`
const myCustomComponents = {
    text: props => <div style={{color: props.color}}>{props.text}</div>
};

<XVIZPanel
    log={log}
    id="00000000-0000-0000-0000-000000000000"
    components={myCustomComponents} />
```
