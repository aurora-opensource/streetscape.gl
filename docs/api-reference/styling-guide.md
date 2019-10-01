# Styling Guide

## Style Overrides

Monochrome uses [emotion](https://emotion.sh) for JavaScript-based styling. Each component offers a
`style` prop that accepts custom CSS overrides. See the documentation of each component for what's
stylable.

## Themes

You may override the default theme by rendering the `ThemeProvider` at the root of your app:

```js
import {ThemeProvider} from '@streetscape.gl/monochrome';

const MY_THEME = {
  extends: 'dark',
  background: '#F0E807',
  textColorPrimary: '#F0E8E7'
};

<ThemeProvider theme={MY_THEME}>
  <MyApp />
</ThemeProvider>;
```

### Theme Object

- `extends` - `light` or `dark`. Default `light`.
- `background`
- `backgroundAlt`
- `backgroundInvert`
- `controlColorPrimary`
- `controlColorSecondary`
- `controlColorHovered`
- `controlColorActive`
- `controlColorDisabled`
- `controlColorWarning`
- `textColorPrimary`
- `textColorSecondary`
- `textColorInvert`
- `textColorDisabled`
- `textColorWarning`
- `textColorError`
- `fontFamily`
- `fontSize`
- `fontWeight`
- `lineHeight`
- `transitionDuration`
- `transitionTimingFunction`
- `shadow`
- `controlSize`
- `spacingTiny`
- `spacingSmall`
- `spacingNormal`
- `spacingLarge`
- `spacingHuge`
