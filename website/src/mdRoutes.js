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

export default [{
  name: 'Documentation',
  path: '/documentation',
  data: [{
    name: 'Overview',
    children: [{
      name: 'Introduction',
      markdown: require('../../docs/README.md')
    }, {
      name: 'Overview',
      markdown: require('../../docs/README.md')
    }, {
      name: 'What\'s New',
      markdown: require('../../docs/whats-new.md')
    }, {
      name: 'Roadmap',
      markdown: require('../../docs/roadmap.md')
    }, {
      name: 'FAQ',
      markdown: require('../../docs/FAQ.md')
    }, {
      name: 'Running Demos',
      markdown: require('../../docs/running-demos.md')
    }, {
      name: 'Develop/Contribute',
      markdown: require('../../docs/develop.md')
    }]
  }, {
    name: 'Developer Guide',
    children: [{
      name: 'Overview',
      markdown: require('../../docs/developer-guide/README.md')
    }, {
      name: 'Convert Data to XVIZ',
      markdown: require('../../docs/developer-guide/convert-data-to-xviz.md')
    }, {
      name: 'Use Custom deck.gl Layers',
      markdown: require('../../docs/developer-guide/use-custom-deck-layers.md')
    }, {
      name: 'Building Custom Applications',
      markdown: require('../../docs/developer-guide/build-custom-applications.md')
    }, {
      name: 'Advanced',
      markdown: require('../../docs/developer-guide/advanced.md')
    }]
  }, {
    name: 'API Reference',
    children: [{
      name: 'LogViewer',
      markdown: require('../../docs/api-reference/log-viewer.md')
    }, {
      name: 'XVIZLoaderInterface',
      markdown: require('../../docs/api-reference/xviz-loader-interface.md')
    }, {
      name: 'XVIZStreamLoader',
      markdown: require('../../docs/api-reference/xviz-stream-loader.md')
    }]
  }]
}];
