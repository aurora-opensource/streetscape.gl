# XVIZPanelComponent (React Component) (experimental)

The base component for [XVIZPanel](/docs/api-reference/xviz-panel.md). This component can be used
without a `XVIZLoader` instance.

> Warning: this component is experimental and may change between minor versions. Refer to the
> CHANGELOG if you encounter any issues.

```jsx
import {_XVIZPanelComponent as XVIZPanelComponent} from 'streetscape.gl';

const UI_CONFIG = {
  type: 'panel',
  children: [
    {
      type: 'container',
      children: [
        {
          type: 'metric',
          streams: ['/vehicle/velocity'],
          title: 'Velocity'
        }
      ]
    }
  ],
  name: 'Metrics Panel'
};

<XVIZPanelComponent name="Metrics" uiConfig={UI_CONFIG}} />
```

## Properties

All of the `XVIZPanel` properties, and the following:

##### UIConfig (Object)

A Declarative UI
[Panel](https://github.com/uber/xviz/blob/master/docs/declarative-ui/layout-elements.md#Panels)
descriptor.
