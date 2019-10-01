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
// Calculate the overlap between two DOMRects.
// Returns a number in square pixels
export function overlap(rect1, rect2) {
  const overlapX = Math.min(rect1.right - rect2.left, rect2.right - rect1.left);
  const overlapY = Math.min(rect1.bottom - rect2.top, rect2.bottom - rect1.top);

  if (overlapX < 0 || overlapY < 0) {
    return 0;
  }
  return overlapX * overlapY;
}

export function offsetRect(rect, [dx = 0, dy = 0]) {
  return {
    left: rect.left + dx,
    top: rect.top + dy,
    right: rect.right + dx,
    bottom: rect.bottom + dy,
    width: rect.width,
    height: rect.height
  };
}
