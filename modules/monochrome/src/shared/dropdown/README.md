# Dropdown

A stateless dropdown control component.

## Usage

    import {Dropdown} from '@streetscape.gl/monochrome';

    <Dropdown value="cat" data={{
      cat: 'Cat',
      dog: 'Dog',
    }} onChange={...} />

## API Reference

### Props

- `value` **(string)** - value of the dropdown.
- `onChange` **(function)** - callback when the value is changed by user action.
- `data` **(object)** - value to label mapping.
- `isEnabled` **(boolean, optional)** - whether the control is enabled. Default is `true`.
- `className` **(string, optional)** - custom class name for the control.
- `style` **(object, optional)** - cursom CSS overrides. See "styling" section below.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - the top level container.
- `border` - the border around the dropdown.
- `select` - the <select> element.
- `icon` - the container around the arrow element on the right of the dropdown.
- `iconArrow` **(element)** - the arrow icon.
- `height` **(number)** - height of the check box. Default is `26`.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const dropdownStyle = {
  border: {
    borderWidth: 2
  },
  icon: props => ({
    '&:before': {
      content: props.hasFocus ? '"↓"' : '"↑"'
    }
  })
};
```

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `height` **(number)** - the height of the checkbox
  - `hasFocus` **(boolean)** - if the control has focus
  - `isEnabled` **(boolean)** - if the control is enabled
  - `isHovered` **(boolean)** - if the pointer is hovering over the control
