# XVIZVideo (React Component) (experimental)

The base component for rendering a Declarative UI
[video](https://github.com/uber/xviz/blob/master/docs/declarative-ui/components.md#Video) component.

> Do not use this component directly unless implementing your own UI component. See
> [XVIZPanel](/docs/api-reference/xviz-panel.md) for how to render generic Declarative UI
> configurations.

> Warning: this component is experimental and may change between minor versions. Refer to the
> CHANGELOG if you encounter any issues.

```js
import {_XVIZVideo as XVIZVideo} from 'streetscape.gl';
```

## Properties

### UI Configuration

##### width (Number|String, optional)

The width of the video. Default `100%`.

##### height (Number|String, optional)

The height of the video. Default `auto`.

##### style (Object, optional)

Custom CSS overrides.

- `wrapper` (Object|Function) - the wrapper component.
- `selector` (Object) - See
  [styling Dropdown](https://github.com/uber-web/monochrome/blob/master/src/shared/dropdown/README.md#styling).

### Declarative UI Component Descriptor

The following props are automatically populated when this component is rendered via `XVIZPanel`. See
Declarative UI specification for details.

##### cameras (Array)

### Log Info

> Advanced warning: this section is for developing customized components only.

The following props are automatically populated when the `log` prop is provided. Supply these props
manually if the component is used without a `XVIZLoader` instance, e.g. connected with a Redux
store:

##### currentTime (number)

The current playback position of the log.

##### streamsMetadata (Object)

A map from stream names to their metadata.

##### streams (Object)

Currently loaded streams.
