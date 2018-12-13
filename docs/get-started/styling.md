# Styling Components

## Style Overrides

streetscape.gl uses [emotion](https://emotion.sh) for JavaScript-based styling. Each component
offers a `style` prop that accepts custom CSS overrides. See the documentation of each component for
what's stylable.

## Themes

You may override the default theme by rendering the `ThemeProvider` at the root of your app:

```js
import {ThemeProvider} from '@streetscape.gl/monochrome';

const MY_THEME = {
  base: 'dark',
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
- `textColorPrimary`
- `textColorSecondary`
- `textColorInvert`
- `textColorDisabled`
- `textColorWarning`
- `textColorError`
- `fontFamily`
- `fontSize`
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
