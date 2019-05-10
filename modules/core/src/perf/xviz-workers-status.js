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
 * Activity status tag.
 * @param {Boolean} isActive - Whether the tag should be marked as active.
 * @param {Object} style - Style overrides for the tag.
 */
const ActivityTag = ({isActive, style}) =>
  isActive ? (
    <div style={{...STYLES.TAG, ...STYLES.POSITIVE, ...style}}>ACTIVE</div>
  ) : (
    <div style={{...STYLES.TAG, ...STYLES.NEGATIVE, ...style}}>INACTIVE</div>
  );

const _formatLastUpdated = lastUpdated =>
  `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;

/**
 * @typedef {Object} Worker - Status of a worker.
 * @property {Date} lastUpdated - Time at which the worker was last active.
 * @property {Boolean} isActive - Whether the worker is currently active.
 */

/**
 * XVIZ workers status view component.
 * @param {Array<Worker>} workers - Workers status.
 * @param {Object} style - Style overrides.
 * @param {Object} style.container - Style of the outer container.
 * @param {Object} style.title - Style of the title.
 */
export const XVIZWorkersStatus = ({workers, style = {}}) =>
  Object.entries(workers).map(([workerId, {lastUpdated, isActive}]) => (
    <div key={workerId} style={{...STYLES.WORKERS.CONTAINER, ...style.container}}>
      <div style={{...STYLES.WORKERS.TITLE, ...style.title}}>
        <h3>Worker {workerId}</h3>
        <ActivityTag isActive={isActive} style={style.tag} />
      </div>
      <div>
        {lastUpdated
          ? `Last active at ${_formatLastUpdated(lastUpdated)}`
          : 'This worker has never been active.'}
      </div>
    </div>
  ));
