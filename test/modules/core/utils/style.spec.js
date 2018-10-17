import test from 'tape';

import {mergeXvizStyles} from 'streetscape.gl/utils/style';

test('style#mergeXvizStyles precedence order', t => {
  const style1 = {
    '/foo': [
      {
        class: 'one',
        color: '#111111'
      }
    ],
    '/bar': [
      {
        class: 'two',
        color: '#222222'
      }
    ]
  };

  const style2 = {
    '/foo': [
      {
        class: 'one',
        color: '#333333',
        fill: true
      }
    ],
    '/bar': [
      {
        class: 'two',
        color: '#444444',
        fill: true
      }
    ],
    '/baz': [
      {
        class: 'three',
        color: '#555555',
        fill: true
      }
    ]
  };

  const mergedStyles = mergeXvizStyles(style1, style2);

  // style1 entries come first, because in XVIZ Styling
  // latter rule definitions overrule earler ones.
  // This is validating that style2 rules are defined
  // after style1
  const expected = {
    '/foo': [
      {
        class: 'one',
        color: '#111111'
      },
      {
        class: 'one',
        color: '#333333',
        fill: true
      }
    ],
    '/bar': [
      {
        class: 'two',
        color: '#222222'
      },
      {
        class: 'two',
        color: '#444444',
        fill: true
      }
    ],
    '/baz': [
      {
        class: 'three',
        color: '#555555',
        fill: true
      }
    ]
  };

  t.deepEqual(mergedStyles, expected, `Merged XVIZ styles should match expected.`);

  t.end();
});
