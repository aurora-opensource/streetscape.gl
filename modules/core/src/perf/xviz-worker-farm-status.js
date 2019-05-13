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
import {STYLES} from './constants';

/**
 * XVIZ worker farm status view component.
 * @param {number} backlog - The size of the worker queue.
 * @param {number} dropped - The number of un-parsed XVIZ messages in the worker queue that had to be dropped.
 * @param {Object} style - Style overrides.
 * @param {Object} style.container - Style of the outer container.
 * @param {Object} style.title - Style of the title.
 */
export const XVIZWorkerFarmStatus = ({backlog, dropped, style = {}}) => (
  <div style={{...STYLES.WORKER_FARM.CONTAINER, ...style.container}}>
    <h3 style={{...STYLES.WORKER_FARM.TITLE, ...style.title}}>XVIZ Worker Farm</h3>
    <div>{`Queue backlog: ${backlog}`}</div>
    <div>{`Dropped: ${dropped}`}</div>
  </div>
);
