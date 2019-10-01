# Popover

Popover and tooltip components.

## Usage

    import {Popover, Tooltip} from '@streetscape.gl/monochrome';

    <Popover content={() => <span>Bonjour!</span>}>
      Click here
    </Popover>
    <Tooltip content={() => <span>Bonjour!</span>}>
      Hover here
    </Tooltip>

All styles are inlined as html style attributes, so there are no stylesheets to import.

## API Reference

### Props

- `content` **(node|function)** - The content to render inside the popover body, either as a render
  callback function or react node. We recommend using a callback so that the content is rendered
  lazily for performance.
- `position` **(enum, optional)** - Position of the popover relative to the target content. See
  constants:positions below. Defaults to `Popover.AUTO`.
- `arrowPosition` **(enum, optional)** - Controls which end of the popover the arrow should be
  anchored on. See constants:positions below. Default is `Popover.AUTO`, which is generally
  centered.
- `onMouseOutDelay` **(number, optional)** - If `trigger` is `hover`, this is the number of
  milliseconds to wait before hiding popover after users mouse leaves target, allowing them to
  interact with the popover content (highlight it, etc.)
- `trigger` **(enum)** - Whether to show the popover on hover or click of the target. See
  constants:triggers below. Default is `Popover.CLICK`. The `Tooltip` class is a convenient
  component that renders a popover that triggers on hover.
- `style` **(object, optional)** - cursom CSS overrides. See "styling" section below.

### Constants

Positions:

- `Popover.TOP`
- `Popover.BOTTOM`
- `Popover.LEFT`
- `Popover.RIGHT`
- `Popover.AUTO`

Triggers:

- `Popover.HOVER`
- `Popover.CLICK`

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - Wrapper element around both the target element and the tooltip.
- `target` - Wrapper element around the target element.
- `content` - Wrapper element around the content element.
- `body` - Element for the popover/tooltip.
- `arrowBorder`: The border of the arrow that points from the popover/tooltip to the target.
- `arrow`: The body of the arrow that points from the popover/tooltip to the target.
- `arrowSize` **(number)** - How big the arrow should be in pixels. Default is `6`.
- `background` **(string)** - Color of the popper.
- `borderWidth` **(number)** - Border width of the popper. Default `1`.
- `borderColor` **(number)** - Border color of the popper.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const popoverStyle = {
  body: {
    maxWidth: 400
  }
};
```

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `arrowSize` **(number)** - the arrow size
  - `position` **(boolean)** - position of the popover relative to the target
  - `arrowPosition` **(boolean)** - position of the arrow
  - `isActive` **(boolean)** - if the popover is activated
