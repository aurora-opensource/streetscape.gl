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

/**
  Utils for manipulating buffer ranges
  A valid "simple range" is in the shape of [start, end]
  A valid "complex range" is an array of sorted, discrete simple ranges
 */

// Create an empty range
export function empty() {
  return [];
}

// Join two ranges
export function add(simpleRange, complexRange) {
  if (!isValid(simpleRange)) {
    return complexRange;
  }

  const result = [];
  let r1 = simpleRange;

  for (let j = 0; j < complexRange.length; j++) {
    const r2 = complexRange[j];

    if (r2[0] > r1[1]) {
      // [  ]
      //     [   ]
      result.push(r1);
      r1 = r2;
    } else if (r1[0] > r2[1]) {
      //      [  ]
      // [   ]
      result.push(r2);
    } else {
      //   [  ]
      // [   ]
      r1 = [Math.min(r1[0], r2[0]), Math.max(r1[1], r2[1])];
    }
  }
  result.push(r1);

  return result;
}

// Intersect two ranges
export function intersect(simpleRange, complexRange) {
  if (!isValid(simpleRange)) {
    return empty();
  }

  const result = [];
  const r1 = simpleRange;

  for (let j = 0; j < complexRange.length; j++) {
    const r2 = complexRange[j];

    if (r2[0] < r1[1] && r1[0] < r2[1]) {
      result.push([Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])]);
    }
  }

  return result;
}

// Subtract a range from another
export function subtract(simpleRange, complexRange) {
  if (!isValid(simpleRange)) {
    return empty();
  }

  const result = [];
  let r1 = simpleRange;

  for (let j = 0; j < complexRange.length; j++) {
    const r2 = complexRange[j];

    if (r1[0] >= r2[1]) {
      //    [   ]
      // [ ]
      continue; // eslint-disable-line
    }
    if (r2[0] >= r1[1]) {
      // [   ]
      //      [ ]
      break;
    }
    if (r2[0] > r1[0]) {
      // [    ]
      //   [   ]
      result.push([r1[0], r2[0]]);
    }
    if (r2[1] < r1[1]) {
      // [    ]
      //   [ ]
      r1 = [r2[1], r1[1]];
    } else {
      // [    ]
      //   [  ]
      r1 = null;
      break;
    }
  }
  if (r1) {
    result.push(r1);
  }
  return result;
}

function isValid(simpleRange) {
  return simpleRange[0] < simpleRange[1];
}
