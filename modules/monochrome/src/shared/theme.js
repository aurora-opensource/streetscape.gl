// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import React from 'react';
import {LIGHT_THEME, DARK_THEME} from './themes';

const ThemeContext = React.createContext(createTheme({}));
const themeCache = new Map();

export function ThemeProvider({theme, children}) {
  let resolvedTheme = themeCache.get(theme);
  if (!resolvedTheme) {
    resolvedTheme = createTheme(theme);
    themeCache.set(theme, resolvedTheme);
  }

  return <ThemeContext.Provider value={resolvedTheme}>{children}</ThemeContext.Provider>;
}

export function evaluateStyle(userStyle, props) {
  if (!userStyle) {
    return null;
  }
  if (typeof userStyle === 'function') {
    return userStyle(props);
  }
  return userStyle;
}

export function withTheme(Component) {
  class ThemedComponent extends React.Component {
    render() {
      return (
        <ThemeContext.Consumer>
          {_theme => <Component {...this.props} theme={_theme} />}
        </ThemeContext.Consumer>
      );
    }
  }

  ThemedComponent.propTypes = Component.propTypes;
  ThemedComponent.defaultProps = Component.defaultProps;

  return ThemedComponent;
}

function createTheme(theme) {
  let base = null;

  switch (theme.extends) {
    case 'dark':
      base = DARK_THEME;
      break;

    default:
      base = LIGHT_THEME;
      break;
  }

  theme = {...base, ...theme};

  // Reset inherited styles
  theme.__reset__ = {
    font: 'initial',
    cursor: 'initial',
    pointerEvents: 'initial',

    background: theme.background,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
    fontWeight: theme.fontWeight,
    lineHeight: theme.lineHeight,
    color: theme.textColorPrimary,
    textAlign: 'start'
  };

  return theme;
}
