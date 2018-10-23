const TARGETS = {
  chrome: '60',
  edge: '15',
  firefox: '53',
  ios: '10.3',
  safari: '10.1',
  node: '8'
};

const CONFIG = {
  default: {
    presets: [
      [
        '@babel/env',
        {
          targets: TARGETS
        }
      ],
      '@babel/react'
    ],
    plugins: ['version-inline', '@babel/proposal-class-properties']
  }
};

CONFIG.es6 = Object.assign({}, CONFIG.default, {
  presets: [
    [
      '@babel/env',
      {
        targets: TARGETS,
        modules: false
      }
    ],
    '@babel/react'
  ]
});

CONFIG.esm = Object.assign({}, CONFIG.default, {
  presets: [
    [
      '@babel/env',
      {
        modules: false
      }
    ],
    '@babel/react'
  ]
});

CONFIG.es5 = Object.assign({}, CONFIG.default, {
  presets: [
    [
      '@babel/env',
      {
        modules: 'commonjs'
      }
    ],
    '@babel/react'
  ]
});

CONFIG.cover = Object.assign({}, CONFIG.default);
CONFIG.cover.plugins = CONFIG.cover.plugins.concat(['istanbul']);

module.exports = function getConfig(api) {
  // eslint-disable-next-line
  const env = api.cache(() => process.env.BABEL_ENV || process.env.NODE_ENV);

  const config = CONFIG[env] || CONFIG.default;
  // Uncomment to debug
  console.error(env, config.plugins); // eslint-disable-line no-console, no-undef
  return config;
};

module.exports.config = CONFIG.es6;
