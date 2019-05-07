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

/* global __IS_LOCAL__ */

import XVIZ_DOCS from '../../../../xviz/website/pages.json';
import STREETSCAPE_DOCS from '../../pages.json';

// TODO: replace with github url when the repo is public
function getXVIZDocUrl(filename) {
  // __IS_LOCAL__ is defined in webpack.config.js
  return __IS_LOCAL__
    ? `./xviz-docs/${filename}`
    : `https://raw.githubusercontent.com/uber/xviz/master/docs/${filename}`;
}
function getStreetscapeDocUrl(filename) {
  // __IS_LOCAL__ is defined in webpack.config.js
  return __IS_LOCAL__
    ? `./streetscape-docs/${filename}`
    : `https://raw.githubusercontent.com/uber/streetscape.gl/master/docs/${filename}`;
}

// mapping from file path in source to generated page url
export const markdownFiles = {};

function generatePath(cachKey, tree, getDocUrl, parentPath = '', depth = 0) {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(cachKey, branch, getDocUrl, parentPath, depth));
    return tree;
  }

  tree.root = cachKey;
  tree.depth = depth;
  if (tree.name) {
    tree.path = tree.name
      .match(/(GeoJson|3D|API|JSON|XVIZ|UI|FAQ|[A-Z]?[a-z'0-9\.]+|\d+)/g)
      .join('-')
      .toLowerCase()
      .replace(/[^\w-]/g, '');
  }
  if (tree.children) {
    generatePath(cachKey, tree.children, getDocUrl, `${parentPath}/${tree.path}`, depth + 1);
  }
  if (typeof tree.markdown === 'string') {
    tree.markdown = getDocUrl(tree.markdown);
    const i = tree.markdown.indexOf('docs/');
    if (i >= 0) {
      markdownFiles[`${cachKey}-${tree.markdown.slice(i)}`] = `${cachKey}${parentPath}/${
        tree.path
      }`;
    }
  }

  return tree;
}

export const aboutPage = {
  root: 'streetscape.gl',
  markdown: getStreetscapeDocUrl('about-avs.md')
};

export const streetscapeDocPages = generatePath(
  'streetscape.gl',
  STREETSCAPE_DOCS,
  getStreetscapeDocUrl
);

export const xvizDocPages = generatePath('xviz', XVIZ_DOCS, getXVIZDocUrl);
