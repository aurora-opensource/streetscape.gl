/* eslint-disable camelcase */
import test from 'tape';

import {mergeXvizStyles} from 'streetscape.gl/utils/style';

test('style#mergeXvizStyles precedence order', t => {
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

  const mergedStyles = mergeXvizStyles(style1, style2);

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
