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
import test from 'tape';
import {mount, shallow} from 'enzyme';

import {Popover, Tooltip} from '@streetscape.gl/monochrome/shared/popover';

import {
  capitalize,
  getOppositePosition,
  nodeHasParent,
  positionsToPopperPlacement
} from '@streetscape.gl/monochrome/shared/popover/utils';

function MockPopperClass() {}
MockPopperClass.prototype.destroy = () => {};

// TODO(twojtasz): fix test failure
test.skip('Popover - hover trigger', t => {
  const content = <p className="content">Content</p>;
  const target = <p className="target">Target</p>;
  const $ = mount(
    <Popover
      position="top"
      arrowPosition="left"
      content={content}
      popperClass={MockPopperClass}
      trigger="hover"
    >
      {target}
    </Popover>
  );

  t.ok($.exists(), 'component should be rendered');
  t.notOk($.find('.content').exists(), 'content should not be rendered yet');
  t.ok($.find('.target').exists(), 'target should be rendered');

  // TODO - react-dom crashes

  // $.find('.target').parent().simulate('mouseenter');
  // t.ok($.find('.content').exists(), 'content should now be rendered');

  // $.find('.target').parent().simulate('mouseleave');
  // t.notOk($.find('.content').exists(), 'content should now be hidden');

  t.end();
});

// TODO(twojtasz): fix test failure
test.skip('Popover - click trigger', t => {
  const content = <p className="content">Content</p>;
  const target = <p className="target">Target</p>;
  const $ = mount(
    <Popover
      position="top"
      arrowPosition="left"
      content={content}
      popperClass={MockPopperClass}
      trigger="click"
    >
      {target}
    </Popover>
  );

  t.ok($.exists(), 'component should be rendered');
  t.notOk($.find('.content').exists(), 'content should not be rendered yet');
  t.ok($.find('.target').exists(), 'target should be rendered');

  // TODO - react-dom crashes

  // $.find('.target').parent().simulate('click');
  // t.ok($.find('.content').exists(), 'content should now be rendered');

  // $.find('.content').simulate('click');
  // t.ok($.find('.content').exists(), 'clicking tooltip content should not hide it');

  // $.find('.target').parent().simulate('click');
  // t.notOk($.find('.content').exists(), 'content should now be hidden');

  t.end();
});

test('Tooltip - simple render test', t => {
  const content = <p className="content">Content</p>;
  const target = <p className="target">Target</p>;
  const $ = shallow(
    <Tooltip position="top" arrowPosition="left" className="mc-tooltip" content={content}>
      {target}
    </Tooltip>
  );

  const $popover = $.find(Popover);
  t.ok($popover.exists(), 'Should render a popover');
  t.is($popover.prop('trigger'), 'hover', 'Should pass correct trigger prop');
  t.is($popover.prop('className'), 'mc-tooltip', 'Should pass correct className');

  t.end();
});

test('Utils - getOppositePosition', t => {
  t.is(getOppositePosition(Popover.TOP), Popover.BOTTOM);
  t.is(getOppositePosition(Popover.RIGHT), Popover.LEFT);
  t.is(getOppositePosition(Popover.BOTTOM), Popover.TOP);
  t.is(getOppositePosition(Popover.LEFT), Popover.RIGHT);
  t.is(getOppositePosition(undefined), Popover.BOTTOM);

  t.end();
});

test('Utils - capitalize', t => {
  t.is(capitalize('bottom'), 'Bottom');
  t.end();
});

test('Utils - nodeHasParent', t => {
  /**
   *      A
   *    /  \
   *   B   C
   *  /
   * D
   */
  const nodeA = {id: 'a'};
  const nodeB = {id: 'b'};
  const nodeC = {id: 'c'};
  const nodeD = {id: 'd'};
  nodeD.parentNode = nodeB;
  nodeB.parentNode = nodeA;
  nodeC.parentNode = nodeA;
  nodeA.parentNode = {};

  t.ok(nodeHasParent(nodeD, nodeD), 'Returns true for self references');
  t.ok(nodeHasParent(nodeD, nodeB), 'Returns true for direct parent');
  t.ok(nodeHasParent(nodeD, nodeA), 'Returns true for root');
  t.notOk(nodeHasParent(nodeD, nodeC), 'Returns false for non-parent');
  t.notOk(nodeHasParent(nodeA, nodeC), 'Returns false for child');
  t.end();
});

test('Utils - positionsToPopperPlacement', t => {
  t.is(positionsToPopperPlacement('top', 'right'), 'top-end');
  t.is(positionsToPopperPlacement('top', 'left'), 'top-start');
  t.is(positionsToPopperPlacement('top', 'auto'), 'top');
  t.is(positionsToPopperPlacement('auto', 'auto'), 'auto');
  t.is(positionsToPopperPlacement('bottom', 'left'), 'bottom-start');
  t.is(positionsToPopperPlacement('left', 'top'), 'left-start');
  t.is(positionsToPopperPlacement(), 'auto');
  t.is(positionsToPopperPlacement(null, null), 'auto');
  t.end();
});
