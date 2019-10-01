# Slider

A stateless slider control component.

## Usage

    import {Slider} from '@streetscape.gl/monochrome';

    <Slider value={0.5} min={0} max={1} onChange={...} />

## API Reference

### Props

- `value` **(number)** - value of the slider.
- `onChange` **(function)** - callback when the value is changed by user action.
- `min` **(number)** - minimum value
- `max` **(number)** - maximum value
- `step` **(number, optional)** - step to snap the value to. Default is `0` (no snapping).
- `isEnabled` **(boolean, optional)** - whether the control is enabled. Default is `true`.
- `className` **(string, optional)** - custom class name for the control.
- `style` **(object, optional)** - cursom CSS overrides. See "styling" section below.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - the top level container.
- `track` - the track element.
- `trackFill` - the part of the track left to the knob.
- `knob` - the knob element.
- `knobSize` **(number)** - size of the knob. Default is `18`.
- `tolerance` **(number)** - number of pixels around the slider that are also interactive. Default
  is `0`.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const sliderStyle = {
  track: {
    height: 2
  },
  knob: props => ({
    borderColor: props.isActive ? 'red' : '#ccc'
  })
};
```

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `knobSize` **(number)** - the knob size
  - `isEnabled` **(boolean)** - if the control is enabled
  - `hasFocus` **(boolean)** - if the control has keyboard focus
  - `isHovered` **(boolean)** - if the pointer is hovering over the control
  - `isActive` **(boolean)** - if the user is interacting with the control
  - `isDragging` **(boolean)** - if the user is dragging the knob
