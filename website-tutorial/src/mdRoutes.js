export default [
  {
    name: 'Documentation',
    path: '/documentation',
    data: [
      {
        name: 'Overview',
        children: [
          {
            name: 'Introduction',
            markdown: require('../../docs/README.md')
          },
          {
            name: 'Overview',
            markdown: require('../../docs/overview.md')
          },
          {
            name: "What's New",
            markdown: require('../../docs/whats-new.md')
          },
          {
            name: 'Roadmap',
            markdown: require('../../docs/roadmap.md')
          },
          {
            name: 'FAQ',
            markdown: require('../../docs/faq.md')
          },
          {
            name: 'Develop/Contribute',
            markdown: require('../../docs/develop.md')
          }
        ]
      },
      {
        name: 'Example Guide',
        children: [
          {
            name: 'Overview',
            markdown: require('../../docs/example-guide/README.md')
          },
          {
            name: 'Running the Example',
            markdown: require('../../docs/example-guide/running-the-example.md')
          },
          {
            name: 'Convert Data to XVIZ',
            markdown: require('../../docs/example-guide/convert-data-to-xviz.md')
          }
        ]
      },
      {
        name: 'Developer Guide',
        children: [
          {
            name: 'Overview',
            markdown: require('../../docs/developer-guide/README.md')
          },
          {
            name: 'Installing',
            markdown: require('../../docs/developer-guide/installing.md')
          },
          {
            name: 'Use Custom deck.gl Layers',
            markdown: require('../../docs/developer-guide/use-custom-deck-layers.md')
          },
          {
            name: 'Building Custom Applications',
            markdown: require('../../docs/developer-guide/build-custom-applications.md')
          },
          {
            name: 'Advanced',
            markdown: require('../../docs/developer-guide/advanced.md')
          }
        ]
      },
      {
        name: 'API Reference',
        children: [
          {
            name: 'LogViewer',
            markdown: require('../../docs/api-reference/log-viewer.md')
          },
          {
            name: 'XVIZLoaderInterface',
            markdown: require('../../docs/api-reference/xviz-loader-interface.md')
          },
          {
            name: 'XVIZStreamLoader',
            markdown: require('../../docs/api-reference/xviz-stream-loader.md')
          }
        ]
      }
    ]
  }
];
