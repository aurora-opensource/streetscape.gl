export default [{
  name: 'Documentation',
  path: '/documentation',
  data: [{
    name: 'Overview',
    children: [{
      name: 'Introduction',
      markdown: require('../../docs/README.md')
    }, {
      name: 'What\'s New',
      markdown: require('../../CHANGELOG.md')
    }, {
      name: 'FAQ',
      markdown: require('../../docs/FAQ.md')
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
