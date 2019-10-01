# Button

A button control component.

## Usage

    import {Button} from '@streetscape.gl/monochrome';

    <Button type={BUTTON.PRIMARY} onClick={...} >Click me</Button>

## API Reference

### Props

- `type` **(enum)** - type of the button. One of the following:
  - `Button.NORMAL` (default)
  - `Button.PRIMARY`
  - `Button.WARNING`
  - `Button.MUTED`
- `onClick` **(function)** - callback when the button is clicked.
- `isEnabled` **(boolean, optional)** - whether the control is enabled. Default is `true`.
- `className` **(string, optional)** - custom class name for the control.
- `style` **(object, optional)** - cursom CSS overrides. See "styling" section below.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - the button element.
- `size` **(number)** - size of the button. Default is `18`.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const toggleStyle = {
  size: 24,
  wrapper: props => ({
    color: props.isHovered ? 'red' : 'black'
  })
};
```

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `type` **(boolean)** - the current type of the button
  - `size` **(number)** - the size of the button
  - `isEnabled` **(boolean)** - if the control is enabled
  - `isHovered` **(boolean)** - if the pointer is hovering over the control
