# Form

This component sets up a list of input controls using JSON descriptors.

## Usage

```js
import {Form} from '@streetscape.gl/monochrome';

const SETTINGS = {
  userHeader: {type: 'header', title: 'User Settings'},
  userType: {
    type: 'radio',
    title: 'Type',
    values: {
      visitor: 'Visitor',
      author: 'Author',
      admin: 'Admin'
    }
  },
  isPublic: {type: 'checkbox', title: 'Profile is public'},
  userName: {type: 'text', title: 'Display Name'}
};

const View = () => {
  return (
    <Form
      data={SETTINGS}
      values={this.state.values}
      onChange={values => this.setState({values: {...this.state.values, ...values}})}
    />
  );
};
```

## API Reference

### Props

#### `data` (Object, required)

A map from key to config object for each input. Keys must be unique.

Config object fields:

- `type`: type of the control, see next section
- `title`: label of the control, usually displayed on top. Can be set to empty. Styling may vary
  based on the control type.
- `tooltip`: show hover tooltip that provides further information about this setting.
- `badge`: show an additional badge next to the label.
- `visible`: if this control is visible. Can be a boolean, or function that takes the current values
  object and returns a boolean.
- `enabled`: if this control is enabled. Can be a boolean, or function that takes the current values
  object and returns a boolean.
- `children`: a nested settings object. The nested controls will be indented to align with the
  parent label.
- `style`: custom CSS overrides. See `Styling` section below.

#### `values` (Object, required)

A flattened map from key to current value for each setting.

#### `onChange` (Function, required)

Callback when the value of an input is changed.

### Supported Control Types

Each control is a key value in the settings definitions object. The name of the key will be used to
update the separate settings value object.

#### Title

- `type` - `title`

Adds the title for a bigger section of setting controls.

#### Header

- `type` - `header`

Adds the title for a section of setting controls.

#### Separator

- `type` - `separator`

Adds a horizontal separator

#### Text

- `type` - `text`
- `showClearButton` **(boolean)** - whether should show a clear text button

Adds a text box. See [TextBox](../shared/text-box/README.md).

#### Range

- `type` - `range`
- `min` **(number)** - minimum value
- `max` **(number)** - maximum value
- `step` **(number)** - step value

Adds a slider. See [Slider](../shared/slider/README.md).

#### Radio

- `type` - `radio`
- `data` **(object)** - A value to display name mapping object

Adds a radio box. See [RadioBox](../shared/radio-box/README.md).

#### Select

- `type` - `select`
- `data` **(object)** - A value to display name mapping object

Adds a dropdown. See [Dropdown](../shared/dropdown/README.md).

#### Checkbox

- `type` - `checkbox`

Adds a 3-state checkbox. `value` is one of `on`, `indeterminate`, or `off`. See
[Checkbox](../shared/checkbox/README.md).

#### Custom

- `type` - `custom`
- `render` **(function)** - A function that returns React node. Recieves self and `{isEnabled}` as
  arguments.

This can be used to a add a custom control to the form.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - wrapper element around the whole form.
- `expander` - the expand/collapse button for input groups.
- `iconExpanded` **(element)** - the icon for expanded groups.
- `iconCollapsed` **(element)** - the icon for collapsed groups.
- `item` - the container of each input item.
- `[type]` - **(object)** style to be passed to each type of input component.
- `label` - **(object)** the labels. The value will be passed to the
  [Label](../shared/label/README.md) component.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const checkboxStyle = {
  label: {
    tooltip: {
      arrowSize: 2
    }
  },
  dropdown: {
    border: {
      borderWidth: 2
    }
  },
  item: props => ({
    display: props.isEnabled ? 'block' : 'none'
  })
};
```

The `wrapper` callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme

The `expander` callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `isExpanded` **(boolean)** - if the group is expanded

The `item` callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `level` **(number)** - the nested level of the item. Root level settings have `level: 0`.
  - `isEnabled` **(boolean)** - whether the item is enabled
  - `type` **(string)** - the type of the input
  - `value` **(any)** - the value of the input
