# DragDropList

A stateless component that renders a list of items that can be reorganized using drag and drop.

## Usage

```js
import {DragDropList} from '@streetscape.gl/monochrome';

const View = () => {
  return (
    <DragDropList
      items={[
        {key: '0', content: 'Item 0'},
        {key: '1', content: 'Item 1'},
        {key: '2', content: 'Item 2'}
      ]}
      onListChange={() => {}}
    />
  );
};
```

## API Reference

### Props

- `items` **(array)** - list of items to render. Each item should have the following fields:
  - `key` **(string)** - unique identifier
  - `content` **(node)** - renderable content of the item
  - `[title]` **(string)** - header of the item. If specified, only the header is draggable.
  - `[className]` **(string)** - additional class name
- `canRemoveItem` **(boolean)** - whether an item can be removed if it's dragged too far. Default
  `false`.
- `onListChange` **(function)** - callback when the user drops an item. Parameters:
  - `event.items` **(array)** - rearranged items list
  - `event.removedItems` **(array)** - removed items
  - `event.targetRect` **(object)** - the bounding box of where the item is dropped
- `style` **(object, optional)** - custom CSS styles. See "styling" section below.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - wrapper element around the whole control.
- `item` - container of one list item.
- `title` - the title element of each list item.
- `placeholder` - the placeholder element when reordering.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

```jsx
const sliderStyle = {
  placeholder: {
    borderStyle: 'solid'
  },
  title: props => ({
    '&:before': {
      content: '"☰"'
    },
    background: props.isDragging ? 'red' : 'transparent'
  })
};
```

The `wrapper` callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `isDragging` **(boolean)** - if the user is dragging an item
  - `isRemoving` **(boolean)** - if the user is removing an item

Other style callback functions will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `isHovered` **(boolean)** - if the pointer is hovering over the header (if `item.title` is
    specified) or the item
  - `isDragging` **(boolean)** - if the item is being dragged
  - `isActive` **(boolean)** - if the item is being dragged or animating after being dropped
  - `isRemoved` **(boolean)** - if the item is being removed
