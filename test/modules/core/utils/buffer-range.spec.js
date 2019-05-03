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

import test from 'tape';

import {add, intersect, subtract} from '@streetscape.gl/core/utils/buffer-range';

test('bufferRangeUtils#add', t => {
  t.deepEquals(add([1, 2], []), [[1, 2]], 'add to empty range');
  t.deepEquals(add([1, 1], [[2, 4]]), [[2, 4]], 'add invalid range');
  t.deepEquals(add([1, 3], [[2, 4]]), [[1, 4]], 'add overlapping ranges');
  t.deepEquals(add([2, 4], [[1, 3]]), [[1, 4]], 'add overlapping ranges');
  t.deepEquals(add([1, 4], [[2, 3]]), [[1, 4]], 'add overlapping ranges');
  t.deepEquals(add([2, 3], [[1, 4]]), [[1, 4]], 'add overlapping ranges');
  t.deepEquals(add([1, 2], [[3, 4]]), [[1, 2], [3, 4]], 'add discrete ranges');
  t.deepEquals(add([3, 4], [[1, 2]]), [[1, 2], [3, 4]], 'add discrete ranges');
  t.deepEquals(
    add([1, 4], [[1, 2], [3, 5], [6, 7]]),
    [[1, 5], [6, 7]],
    'add multiple overlapping ranges'
  );
  t.deepEquals(
    add([4, 8], [[1, 2], [3, 5], [6, 7]]),
    [[1, 2], [3, 8]],
    'add multiple overlapping ranges'
  );

  t.end();
});

test('bufferRangeUtils#intersect', t => {
  t.deepEquals(intersect([1, 2], []), [], 'intersect with empty range');
  t.deepEquals(intersect([2, 2], [[1, 2]]), [], 'intersect invalid range');
  t.deepEquals(intersect([1, 3], [[2, 4]]), [[2, 3]], 'intersect overlapping ranges');
  t.deepEquals(intersect([1, 4], [[2, 3]]), [[2, 3]], 'intersect overlapping ranges');
  t.deepEquals(intersect([2, 3], [[1, 4]]), [[2, 3]], 'intersect overlapping ranges');
  t.deepEquals(intersect([1, 2], [[3, 4]]), [], 'intersect discrete ranges');
  t.deepEquals(intersect([3, 4], [[1, 3]]), [], 'intersect discrete ranges');
  t.deepEquals(
    intersect([1, 4], [[1, 2], [3, 5], [6, 7]]),
    [[1, 2], [3, 4]],
    'intersect multiple ranges'
  );
  t.deepEquals(intersect([4, 8], [[1, 2], [3, 4], [6, 7]]), [[6, 7]], 'intersect multiple ranges');

  t.end();
});

test('bufferRangeUtils#subtract', t => {
  t.deepEquals(subtract([1, 3], []), [[1, 3]], 'subtract empty range');
  t.deepEquals(subtract([2, 2], [[1, 2]]), [], 'subtract invalid range');
  t.deepEquals(subtract([1, 3], [[1, 2]]), [[2, 3]], 'subtract overlapping range');
  t.deepEquals(subtract([1, 3], [[2, 3]]), [[1, 2]], 'subtract overlapping range');
  t.deepEquals(subtract([1, 4], [[2, 3]]), [[1, 2], [3, 4]], 'subtract overlapping range');
  t.deepEquals(subtract([2, 3], [[1, 4]]), [], 'subtract overlapping range');
  t.deepEquals(subtract([2, 3], [[1, 2]]), [[2, 3]], 'subtract discrete range');
  t.deepEquals(subtract([2, 3], [[4, 5]]), [[2, 3]], 'subtract discrete range');
  t.deepEquals(
    subtract([1, 5], [[1, 2], [3, 4], [6, 7]]),
    [[2, 3], [4, 5]],
    'subtract multiple ranges'
  );
  t.deepEquals(
    subtract([4, 8], [[1, 2], [3, 4], [6, 7]]),
    [[4, 6], [7, 8]],
    'subtract multiple ranges'
  );
  t.end();
});
