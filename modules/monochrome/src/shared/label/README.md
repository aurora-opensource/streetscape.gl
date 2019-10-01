# Label

A label component.

## Usage

    import {Label} from '@streetscape.gl/monochrome';

    <Label tooltip="percentage to reduce the color saturation" >Desaturation</Label>

## API Reference

### Props

- `tooltip` **(string, optional)** - if supplied, render a "?" icon next to the label to offer more
  information.
- `badge` **(element, optional)** - if supplied, will be rendered next to the label text.
- `style` **(object, optional)** - cursom CSS overrides. See "styling" section below.

### Styling

The `style` prop expects an object that may contain the following keys:

- `label` - the label.
- `tooltip` - the tooltip. This value will be passed to the [Tooltip](../shared/popover/README.md)
  component.
- `tooltipTarget` - the container around the info icon.
- `iconInfo` **(element)** - the info icon

The values define the styling overrides for the respective child components. Each value can be an
object, or a callback function.

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
