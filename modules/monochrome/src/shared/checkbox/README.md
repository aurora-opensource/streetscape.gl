# CheckBox

A stateless, 3-state check box control component.

## Usage

    import {CheckBox} from '@streetscape.gl/monochrome';

    <CheckBox label="Include package" value={CheckBox.ON} onChange={...} />

## API Reference

### Props

- `value` **(enum)** - value of the check box. See constants below.
- `onChange` **(function)** - callback when the value is changed by user action.
- `isEnabled` **(boolean, optional)** - whether the control is enabled. Default is `true`.
- `className` **(string, optional)** - custom class name for the control.
- `label` **(string | element, optional)** - label for the control.
- `style` **(object, optional)** - cursom CSS overrides. See "styling" section below.

### Constants

Values:

- `CheckBox.ON`
- `CheckBox.OFF`
- `CheckBox.INDETERMINATE`

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - wrapper element around both the label and the checkbox.
- `border` - the border around the checkbox.
- `icon` - the container around the icon in the checkbox.
- `iconOn` **(element)** - the icon for `ON` state.
- `iconOff` **(element)** - the icon for `OFF` state.
- `iconIndeterminate` **(element)** - the icon for `INDETERMINATE` state.
- `size` **(number)** - size of the check box. Default is `18`.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const checkboxStyle = {
  border: {
    width: 20,
    height: 20
  },
  icon: props => ({
    color: props.value === CheckBox.ON ? 'red' : '#000'
  })
};
```

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `value` **(enum)** - the current value of the checkbox
  - `size` **(number)** - the size of the checkbox
  - `isEnabled` **(boolean)** - if the control is enabled
  - `hasFocus` **(boolean)** - if the control has keyboard focus
  - `isHovered` **(boolean)** - if the pointer is hovering over the control
