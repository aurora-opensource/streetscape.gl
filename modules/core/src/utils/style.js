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
 * Deep merges two XVIZ style objects.
 * The primary style stream rules will take precedence over the secondary rules.
 *
 * @param style1 {object} Secondary stylesheet
 * @param style2 {object} Primary stylesheet
 * @returns {object} Merged stylesheet with Primary rules taking precedence
 */
export function mergeXVIZStyles(style1, style2) {
  if (!style1) {
    return style2 || {};
  }
  if (!style2) {
    return style1;
  }

  const mergedStyles = {...style1};

  for (const streamName in style2) {
    if (mergedStyles[streamName]) {
      const rules1 = style1[streamName];
      const rules2 = style2[streamName];
      mergedStyles[streamName] = rules1.concat(rules2);
    } else {
      mergedStyles[streamName] = style2[streamName];
    }
  }
  return mergedStyles;
}
