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
import {POSITIONS} from './popover';

export function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

export function getOppositePosition(side) {
  switch (side) {
    case POSITIONS.TOP:
      return POSITIONS.BOTTOM;
    case POSITIONS.RIGHT:
      return POSITIONS.LEFT;
    case POSITIONS.BOTTOM:
      return POSITIONS.TOP;
    case POSITIONS.LEFT:
      return POSITIONS.RIGHT;
    default:
      return POSITIONS.BOTTOM;
  }
}

/**
 * Some of this logic for generating arrows may seem rather complicated.
 * Normally Popper.js has an accompanying css file with some of the necessary
 * rules, but in the interest of having zero css dependencies, we'll move
 * this styling/positioning logic into js
 */
export function generateTriangleStyles(position, size) {
  // Generate borderWidth & borderColor rules
  const positions = [POSITIONS.TOP, POSITIONS.RIGHT, POSITIONS.BOTTOM, POSITIONS.LEFT];
  // Set border width to zero for opposite position
  const oppositePosition = getOppositePosition(position);
  const style = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid'
  };

  for (const p of positions) {
    const key = capitalize(p);
    const width = p === oppositePosition ? 0 : size;
    const color = p === position ? undefined : 'transparent';
    style[`border${key}Width`] = width;
    style[`border${key}Color`] = color;
  }

  return style;
}

export function nodeHasParent(current, possibleParent) {
  if (current === possibleParent) {
    return true;
  }
  while (current.parentNode) {
    if (current === possibleParent) {
      return true;
    }
    current = current.parentNode;
  }
  return false;
}

export function positionsToPopperPlacement(position, arrowPosition) {
  let placement = position || POSITIONS.AUTO;
  if (arrowPosition === POSITIONS.LEFT || arrowPosition === POSITIONS.TOP) {
    placement = `${placement}-start`;
  }
  if (arrowPosition === POSITIONS.RIGHT || arrowPosition === POSITIONS.BOTTOM) {
    placement = `${placement}-end`;
  }
  return placement;
}
