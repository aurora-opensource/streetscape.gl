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
  // translation links
  // A -> B -> C
  // A -> D -> E
  //
  // rotation links
  // r90 -> m10 -> DD
  // rn90 -> m20 -> CC
  //
  // cycle links
  // cycleA -> cycleB -> cycleA
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
    E: {
      target_pose: 'D'
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
    },
    cycleA: {
      target_pose: 'cycleB'
    },
    cycleB: {
      target_pose: 'cycleA'
    }
  };

  const poses = {
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
    D: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 0,
      y: 0,
      z: 0
    },
    E: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 10,
      y: 10,
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
    },
    cycleA: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 5,
      y: 5,
      z: 0
    },
    cycleB: {
      yaw: 0,
      pitch: 0,
      roll: 0,
      x: 5,
      y: 5,
      z: 0
    }
  };

  const testCases = [
    {stream: 'A', expected: [10, 10, 0]}, // no link, just pose
    {stream: 'C', expected: [30, 30, 0]}, // 2 links, 2 poses
    {stream: 'D', expected: [10, 10, 0]}, // 1 link, 1 pose
    {stream: 'E', expected: [20, 20, 0]}, // 2 links, 3 poses
    {stream: 'Z', expected: null}, // missing pose
    {stream: 'CC', expected: [20, -20, 0]}, // rotation & translation path
    {stream: 'DD', expected: [-10, 10, 0]}, // rotation & translation path
    {stream: 'cycleB', expected: null} // cycle in path
  ];

  // For each testcase, resolve the transform for the named stream
  // and verify the expected
  for (const testcase of testCases) {
    const transformTo = resolveLinksTransform(links, poses, testcase.stream);
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
        `null return matches expected '${testcase.expected}'`
      );
    }
  }

  t.end();
});
