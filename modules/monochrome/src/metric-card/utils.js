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
const DEFAULT_GET_X = d => d.x;
/**
 * Performs binary search for the closest value to timestamp in a metric
 * @param {array} array - array of values sorted by x
 * @param {number} x - the target x value
 * @param {function, optional} getX - x accessor
 * @returns {object} nearest value
 */
export function findNearestValue(array, x, getX = DEFAULT_GET_X) {
  let lowerBound = 0;
  let upperBound = array.length - 1;
  let currentIndex;
  let currentX;

  while (lowerBound <= upperBound) {
    currentIndex = ((lowerBound + upperBound) / 2) | 0;
    currentX = getX(array[currentIndex]);

    if (currentX < x) {
      lowerBound = currentIndex + 1;
    } else if (currentX > x) {
      upperBound = currentIndex - 1;
    } else {
      return array[currentIndex];
    }
  }

  // No precise match, find the closer one between the two bounds
  const lowerValue = array[lowerBound];
  const upperValue = array[upperBound];

  if (!lowerValue) {
    // at end of array
    return upperValue;
  }
  if (!upperValue) {
    // at beginning of array
    return lowerValue;
  }

  return Math.abs(getX(lowerValue) - x) <= Math.abs(getX(upperValue) - x) ? lowerValue : upperValue;
}
