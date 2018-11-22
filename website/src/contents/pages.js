// TODO: replace with github url when the repo is public
function getXVIZDocUrl(filename) {
  return `/xviz-docs/${filename}`;
}
function getStreetscapeDocUrl(filename) {
  return `/streetscape-docs/${filename}`;
}

// mapping from file path in source to generated page url
export const markdownFiles = {};

function generatePath(cachKey, tree, parentPath = '', depth = 0) {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(cachKey, branch, parentPath, depth));
    return tree;
  }

  tree.depth = depth;
  if (tree.name) {
    tree.path = tree.name
      .match(/(GeoJson|3D|API|JSON|XVIZ|UI|FAQ|[A-Z]?[a-z'0-9\.]+|\d+)/g)
      .join('-')
      .toLowerCase()
      .replace(/[^\w-]/g, '');
  }
  if (tree.children) {
    generatePath(cachKey, tree.children, `${parentPath}/${tree.path}`, depth + 1);
  }
  if (typeof tree.markdown === 'string') {
    const i = tree.markdown.indexOf('docs/');
    if (i >= 0) {
      markdownFiles[tree.markdown.slice(i)] = `${cachKey}${parentPath}/${tree.path}`;
    }
  }

  return tree;
}

export const streetscapeDocPages = generatePath('streetscape.gl', [
  {
    name: 'Overview',
    children: [
      {
        name: 'Introduction',
        markdown: getStreetscapeDocUrl('README.md')
      },
      {
        name: 'Overview',
        markdown: getStreetscapeDocUrl('overview.md')
      },
      {
        name: "What's New",
        markdown: getStreetscapeDocUrl('whats-new.md')
      },
      {
        name: 'Roadmap',
        markdown: getStreetscapeDocUrl('roadmap.md')
      },
      {
        name: 'FAQ',
        markdown: getStreetscapeDocUrl('faq.md')
      },
      {
        name: 'Develop/Contribute',
        markdown: getStreetscapeDocUrl('develop.md')
      }
    ]
  },
  {
    name: 'Example Guide',
    children: [
      {
        name: 'Overview',
        markdown: getStreetscapeDocUrl('example-guide/README.md')
      },
      {
        name: 'Running the Example',
        markdown: getStreetscapeDocUrl('example-guide/running-the-example.md')
      },
      {
        name: 'Convert Data to XVIZ',
        markdown: getStreetscapeDocUrl('example-guide/convert-data-to-xviz.md')
      }
    ]
  },
  {
    name: 'Developer Guide',
    children: [
      {
        name: 'Overview',
        markdown: getStreetscapeDocUrl('developer-guide/README.md')
      },
      {
        name: 'Installing',
        markdown: getStreetscapeDocUrl('developer-guide/installing.md')
      },
      {
        name: 'Use Custom deck.gl Layers',
        markdown: getStreetscapeDocUrl('developer-guide/use-custom-deck-layers.md')
      },
      {
        name: 'Building Custom Applications',
        markdown: getStreetscapeDocUrl('developer-guide/build-custom-applications.md')
      },
      {
        name: 'Advanced',
        markdown: getStreetscapeDocUrl('developer-guide/advanced.md')
      }
    ]
  },
  {
    name: 'API Reference',
    children: [
      {
        name: 'LogViewer',
        markdown: getStreetscapeDocUrl('api-reference/log-viewer.md')
      },
      {
        name: 'XVIZLoaderInterface',
        markdown: getStreetscapeDocUrl('api-reference/xviz-loader-interface.md')
      },
      {
        name: 'XVIZStreamLoader',
        markdown: getStreetscapeDocUrl('api-reference/xviz-stream-loader.md')
      }
    ]
  }
]);

export const xvizDocPages = generatePath('xviz', [
  {
    name: 'Overview',
    children: [
      {
        name: 'Introduction',
        markdown: getXVIZDocUrl('README.md')
      },
      {
        name: "What's New",
        markdown: getXVIZDocUrl('whats-new.md')
      },
      {
        name: 'Versioning',
        markdown: getXVIZDocUrl('overview/versioning.md')
      },
      {
        name: 'Concepts',
        markdown: getXVIZDocUrl('overview/concepts.md')
      },
      {
        name: 'Conventions',
        markdown: getXVIZDocUrl('overview/conventions.md')
      },
      {
        name: 'Roadmap',
        markdown: getXVIZDocUrl('overview/roadmap.md')
      },
      {
        name: 'Related Projects',
        markdown: getXVIZDocUrl('overview/related.md')
      }
    ]
  },
  {
    name: "Developer's Guide",
    children: [
      {
        name: 'Overview',
        markdown: getXVIZDocUrl('developers-guide/README.md')
      },
      {
        name: 'Installing',
        markdown: getXVIZDocUrl('developers-guide/installing-xviz.md')
      },
      {
        name: 'Structure of XVIZ Data',
        markdown: getXVIZDocUrl('developers-guide/structure-of-xviz.md')
      },
      {
        name: 'Generating XVIZ',
        markdown: getXVIZDocUrl('developers-guide/generating-xviz.md')
      },
      {
        name: 'Validating XVIZ',
        markdown: getXVIZDocUrl('developers-guide/validating-xviz.md')
      },
      {
        name: 'Serving XVIZ',
        markdown: getXVIZDocUrl('developers-guide/serving-xviz.md')
      },
      {
        name: 'Parsing XVIZ',
        markdown: getXVIZDocUrl('developers-guide/parsing-xviz.md')
      },
      {
        name: 'Styling XVIZ',
        markdown: getXVIZDocUrl('developers-guide/styling-xviz.md')
      },
      {
        name: 'Using the Declarative UI',
        markdown: getXVIZDocUrl('developers-guide/using-declarative-ui.md')
      },
      {
        name: 'Using XVIZ without JavaScript',
        markdown: getXVIZDocUrl('developers-guide/using-xviz-in-other-languages.md')
      }
    ]
  },
  {
    name: 'Protocol Schema',
    children: [
      {
        name: 'Core Protocol',
        markdown: getXVIZDocUrl('protocol-schema/core-protocol.md')
      },
      {
        name: 'Session Protocol',
        markdown: getXVIZDocUrl('protocol-schema/session-protocol.md')
      },
      {
        name: 'Geometry Primitives',
        markdown: getXVIZDocUrl('protocol-schema/geometry-primitives.md')
      },
      {
        name: 'Styling Specification',
        markdown: getXVIZDocUrl('protocol-schema/style-specification.md')
      },
      {
        name: 'Declarative UI',
        markdown: getXVIZDocUrl('protocol-schema/declarative-ui.md')
      },
      {
        name: 'UI Primitives',
        markdown: getXVIZDocUrl('protocol-schema/ui-primitives.md')
      }
    ]
  },
  {
    name: 'Protocol Implementations',
    children: [
      {
        name: 'JSON Protocol',
        markdown: getXVIZDocUrl('protocol-formats/json-protocol.md')
      },
      {
        name: 'Binary Protocol',
        markdown: getXVIZDocUrl('protocol-formats/binary-protocol.md')
      }
    ]
  },
  {
    name: 'API Reference',
    children: [
      {
        name: '@xviz/parser',
        children: [
          {
            name: 'XVIZBuilder',
            markdown: getXVIZDocUrl('api-reference/xviz-builder.md')
          },
          {
            name: 'XVIZMetadataBuilder',
            markdown: getXVIZDocUrl('api-reference/xviz-metadata-builder.md')
          },
          {
            name: 'XVIZUIBuilder',
            markdown: getXVIZDocUrl('api-reference/xviz-ui-builder.md')
          }
        ]
      },
      {
        name: '@xviz/parser',
        children: [
          {
            name: 'XVIZ Configuration',
            markdown: getXVIZDocUrl('api-reference/xviz-configuration.md')
          },
          {
            name: 'XVIZ Parsing',
            markdown: getXVIZDocUrl('api-reference/parse-xviz.md')
          },
          {
            name: 'XVIZSynchronizer',
            markdown: getXVIZDocUrl('api-reference/xviz-synchronizer.md')
          },
          {
            name: 'XVIZLogSlice',
            markdown: getXVIZDocUrl('api-reference/xviz-log-slice.md')
          },
          {
            name: 'XVIZObject',
            markdown: getXVIZDocUrl('api-reference/xviz-object.md')
          },
          {
            name: 'XVIZObjectCollection',
            markdown: getXVIZDocUrl('api-reference/xviz-object-collection.md')
          },
          {
            name: 'XVIZ Loader',
            markdown: getXVIZDocUrl('api-reference/xviz-loader.md')
          },
          {
            name: 'XVIZValidator',
            markdown: getXVIZDocUrl('api-reference/xviz-validator.md')
          }
        ]
      }
    ]
  }
]);
