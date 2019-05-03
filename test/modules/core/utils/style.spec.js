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

/* eslint-disable camelcase */
import test from 'tape';

import {mergeXVIZStyles} from '@streetscape.gl/core/utils/style';

test('style#mergeXVIZStyles precedence order', t => {
  const style1 = {
    '/foo': [
      {
        name: 'one',
        style: {
          fill_color: '#111111'
        }
      }
    ],
    '/bar': [
      {
        name: 'two',
        style: {
          fill_color: '#222222'
        }
      }
    ]
  };

  const style2 = {
    '/foo': [
      {
        name: 'one',
        style: {
          fill_color: '#333333',
          fill: true
        }
      }
    ],
    '/bar': [
      {
        name: 'two',
        style: {
          fill_color: '#444444',
          fill: true
        }
      }
    ],
    '/baz': [
      {
        name: 'three',
        style: {
          fill_color: '#555555',
          fill: true
        }
      }
    ]
  };

  const mergedStyles = mergeXVIZStyles(style1, style2);

  // style1 entries come first, because in XVIZ Styling
  // latter rule definitions overrule earler ones.
  // This is validating that style2 rules are defined
  // after style1
  const expected = {
    '/foo': [
      {
        name: 'one',
        style: {
          fill_color: '#111111'
        }
      },
      {
        name: 'one',
        style: {
          fill_color: '#333333',
          fill: true
        }
      }
    ],
    '/bar': [
      {
        name: 'two',
        style: {
          fill_color: '#222222'
        }
      },
      {
        name: 'two',
        style: {
          fill_color: '#444444',
          fill: true
        }
      }
    ],
    '/baz': [
      {
        name: 'three',
        style: {
          fill_color: '#555555',
          fill: true
        }
      }
    ]
  };

  t.deepEqual(mergedStyles, expected, `Merged XVIZ styles should match expected.`);

  t.end();
});
