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

/* global document */
import {Texture2D} from '@luma.gl/core';

const CANVAS_SIZE = 256;

function drawArrow(ctx, {x, y, size, strokeWidth, scaleX = 1}) {
  const halfSize = size / 2;
  const headSize = size / 4;

  const getX = px => (halfSize - px) * scaleX + x + halfSize;
  const getY = py => py + y;

  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(getX(0), getY(halfSize));
  ctx.lineTo(getX(size), getY(halfSize));
  ctx.moveTo(getX(size - headSize), getY(halfSize - headSize));
  ctx.lineTo(getX(size), getY(halfSize));
  ctx.lineTo(getX(size - headSize), getY(halfSize + headSize));
  ctx.stroke();
}

/*
 * renders traffic light shapes to texture2D.
 * @param {WebGLRenderingContext} glContext
 */
export function makeLightShapeTexture(gl) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = CANVAS_SIZE * 4;
  canvas.height = CANVAS_SIZE;

  /*
   *  +-----------+-----------+------------+
   *  | circular  | turn_left | turn_right |
   *  +-----------+-----------+------------+
   */

  // circular (no mask)
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, CANVAS_SIZE * 4, CANVAS_SIZE);

  // left arrow
  ctx.fillStyle = '#444';
  ctx.fillRect(CANVAS_SIZE, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = '#fff';
  drawArrow(ctx, {
    x: CANVAS_SIZE * 1.333,
    y: CANVAS_SIZE / 3,
    size: CANVAS_SIZE / 3,
    strokeWidth: CANVAS_SIZE / 16
  });

  // right arrow
  ctx.fillStyle = '#444';
  ctx.fillRect(CANVAS_SIZE * 2, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.strokeStyle = '#fff';
  drawArrow(ctx, {
    x: CANVAS_SIZE * 2.333,
    y: CANVAS_SIZE / 3,
    size: CANVAS_SIZE / 3,
    strokeWidth: CANVAS_SIZE / 16,
    scaleX: -1
  });

  return new Texture2D(gl, {data: canvas});
}
