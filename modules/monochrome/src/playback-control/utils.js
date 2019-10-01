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
/**
 * convert number of seconds to time code format
 * @params {Number} value - number of seconds
 * @params {Integer} precision - number of decimal places to round to
 * @params {String} format - h: hours, m: minutes, s: seconds, S: fractional seconds
 */
export function formatTimeCode(value, format = '{hh}:{mm}:{ss}.{SSS}') {
  const formatters = {
    h: (format.match(/\{(h+)\}/) || [])[1],
    m: (format.match(/\{(m+)\}/) || [])[1],
    s: (format.match(/\{(s+)\}/) || [])[1],
    S: (format.match(/\{(S+)\}/) || [])[1]
  };

  const parts = {
    h: x => Math.floor(x / 3600),
    m: x => Math.floor(x / 60) % 60,
    s: x => Math.floor(x % 60),
    S: (x, len) => Math.floor((x % 1) * Math.pow(10, len))
  };

  let result = format;
  for (const key in parts) {
    const f = formatters[key] || '';
    if (f) {
      const digits = f.length;
      result = result.replace(`{${f}}`, String(parts[key](value, digits)).padStart(digits, '0'));
    }
  }
  return result;
}

/*
 * Get ticks for a timeline
 * @params {d3.Scale} scale - a scale that maps domain (time, seconds) to range (x, pixels)
 * @params {Number} spacing - spacing between ticks in pixels
 * @returns {Array} ticks in the shape of {x, label}
 */
export function getTimelineTicks(scale, spacing = 50, format) {
  const range = scale.range();
  const domain = scale.domain();
  const ticksCount = Math.floor((range[1] - range[0]) / spacing) + 1;

  scale.domain([0, domain[1] - domain[0]]);
  const ticks = scale.ticks(ticksCount);
  scale.domain(domain);

  return ticks.map(t => ({
    x: scale(t + domain[0]),
    label: format(t + domain[0])
  }));
}
