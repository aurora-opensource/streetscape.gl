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
import {storiesOf} from '@storybook/react';
import {withReadme} from 'storybook-readme';

import README from './README.md';
import {Table, TreeTable} from './index';

/* Generate random data */
const COLUMNS = [
  {name: 'Object ID', id: 0, type: 'string'},
  {name: 'Timestamp', id: 1, type: 'int'},
  {name: 'Source', id: 2, type: 'string'},
  {name: 'Index', id: 3, type: 'string'},
  {name: 'Promoted', id: 4, type: 'boolean'},
  {name: 'Anomaly', id: 5, type: 'boolean'}
];

const sources = 'US EU China Brazil India Turkey Japan'.split(' ');
const len = [8, 4, 4, 4, 12];
const id = [0, 0, 0, 0, 0];

const makeUuid = () => {
  return id.map((d, i) => String(d).padStart(len[i], '0')).join('-');
};

const MAX_NODE_COUNT = 2000;
let nodeCount = 0;
const makeRandomData = depth => {
  id[depth]++;

  const childCount =
    depth < id.length - 1 && nodeCount < MAX_NODE_COUNT
      ? Math.round(1 / (depth + 1) / Math.random())
      : 0;
  nodeCount += childCount;

  return {
    data: [
      makeUuid(), // string
      Date.now(), // int
      depth > 0 ? null : sources[Math.floor(Math.random() * sources.length)], // string
      depth > 0 ? null : id.reduce((sum, d) => sum + d, 0).toString(), // string
      Math.random() < 0.3, // bool
      Math.random() < 0.7 // bool
    ],
    children: Array.from({length: childCount}, () => makeRandomData(depth + 1))
  };
};

const ROWS = Array.from({length: 200}, () => makeRandomData(0));

storiesOf('Table', module)
  .addDecorator(withReadme(README))
  .add('Table', () => <Table columns={COLUMNS} rows={ROWS} />)
  .add('TreeTable', () => <TreeTable columns={COLUMNS} rows={ROWS} />);
