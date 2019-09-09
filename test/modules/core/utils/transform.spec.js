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

import {resolveLinksTransform} from '@streetscape.gl/core/utils/transform';

test('resolveLinksTransform', t => {
  // transation links
  // A -> B -> C
  // A -> D
  //
  // rotation links
  // r90 -> m10 -> DD
  // rn90 -> m20 -> CC
  const links = {
    C: {
      target_pose: 'B'
    },
    B: {
      target_pose: 'A'
    },
    D: {
      target_pose: 'A'
    },
    CC: {
      target_pose: 'm20'
    },
    DD: {
      target_pose: 'm10'
    },
    m10: {
      target_pose: 'r90'
    },
    m20: {
      target_pose: 'rn90'
    }
  };

  const streams = {
    A: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 10,
      y: 10,
      z: 0
    },
    B: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 20,
      y: 20,
      z: 0
    },
    r90: {
      yaw: Math.PI / 2,
      pitch: 0,
      roll: 0,
      x: 0,
      y: 0,
      z: 0
    },
    rn90: {
      yaw: -Math.PI / 2,
      pitch: 0,
      roll: 0,
      x: 0,
      y: 0,
      z: 0
    },
    m10: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 10,
      y: 10,
      z: 0
    },
    m20: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 20,
      y: 20,
      z: 0
    }
  };

  const testCases = [
    {stream: 'C', expected: [30, 30, 0]},
    {stream: 'D', expected: [10, 10, 0]},
    {stream: 'E', expected: null},
    {stream: 'CC', expected: [20, -20, 0]},
    {stream: 'DD', expected: [-10, 10, 0]}
  ];

  for (const testcase of testCases) {
    const transformTo = resolveLinksTransform(links, streams, testcase.stream);
    if (transformTo) {
      const resultOrigin = transformTo.transformVector([0, 0, 0]);

      t.comment(typeof resultOrigin);
      t.comment(typeof testcase.expected);
      t.deepEqual(
        testcase.expected,
        resultOrigin,
        `transformed origin of ${testcase.stream} matches expected result ${testcase.expected}`
      );
    } else {
      t.equal(
        transformTo,
        testcase.expected,
        `missing links entry matches expected '${testcase.expected}'`
      );
    }
  }

  t.end();
});
