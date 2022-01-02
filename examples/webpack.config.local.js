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

// This file contains webpack configuration settings that allow
// examples to be built against the deck.gl source code in this repo instead
// of building against their installed version of deck.gl.
//
// This enables using the examples to debug the main deck.gl library source
// without publishing or npm linking, with conveniences such hot reloading etc.

// avoid destructuring for older Node version support
const {resolve} = require('path');

const ALIASES = require('ocular-dev-tools/config/ocular.config')({
  root: resolve(__dirname, '..')
}).aliases;

// Support for hot reloading changes to the deck.gl library:
function makeLocalDevConfig() {
  return {
    // TODO - Uncomment when all examples use webpack 4 for faster bundling
    // mode: 'development',

    // suppress warnings about bundle size
    devServer: {
      historyApiFallback: true,
      stats: {
        warnings: false
      }
    },

    devtool: 'source-map',

    resolve: {
      alias: Object.assign(
        {
          react: resolve(__dirname, '../node_modules/react'),
          'react-dom': resolve(__dirname, '../node_modules/react-dom'),
          'math.gl': resolve(__dirname, '../node_modules/math.gl'),
          '@deck.gl/core': resolve(__dirname, '../node_modules/@deck.gl/core'),
          '@deck.gl/layers': resolve(__dirname, '../node_modules/@deck.gl/layers'),
          '@deck.gl/mesh-layers': resolve(__dirname, '../node_modules/@deck.gl/mesh-layers'),
          '@deck.gl/react': resolve(__dirname, '../node_modules/@deck.gl/react'),
          '@luma.gl/addons': resolve(__dirname, '../node_modules/@luma.gl/addons'),
          '@luma.gl/constants': resolve(__dirname, '../node_modules/@luma.gl/constants'),
          '@luma.gl/core': resolve(__dirname, '../node_modules/@luma.gl/core'),
          '@luma.gl/shadertools': resolve(__dirname, '../node_modules/@luma.gl/shadertools'),
          '@luma.gl/webgl': resolve(__dirname, '../node_modules/@luma.gl/webgl'),
          '@luma.gl/webgl-state-tracker': resolve(
            __dirname,
            '../node_modules/@luma.gl/webgl-state-tracker'
          ),
          '@luma.gl/webgl2-polyfill': resolve(__dirname, '../node_modules/@luma.gl/webgl2-polyfill')
        },
        ALIASES
      )
    },
    module: {
      rules: [
        {
          // Unfortunately, webpack doesn't import library sourcemaps on its own...
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        }
      ]
    }
  };
}

function addLocalDevSettings(config, exampleDir) {
  const LOCAL_DEV_CONFIG = makeLocalDevConfig(exampleDir);
  config = Object.assign({}, LOCAL_DEV_CONFIG, config);
  config.resolve = Object.assign({}, LOCAL_DEV_CONFIG.resolve, config.resolve || {});
  config.resolve.alias = config.resolve.alias || {};
  Object.assign(config.resolve.alias, LOCAL_DEV_CONFIG.resolve.alias);

  config.module = config.module || {};
  Object.assign(config.module, {
    rules: (config.module.rules || []).concat(LOCAL_DEV_CONFIG.module.rules)
  });

  const babelLoader = config.module.rules.find(rule => rule.loader === 'babel-loader');
  if (babelLoader) {
    babelLoader.options.presets = [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-flow'
    ];
  }
  return config;
}

module.exports = (config, exampleDir) => env => {
  // npm run start-local now transpiles the lib
  if (env && env.local) {
    config = addLocalDevSettings(config, exampleDir);
  }

  // npm run start-es6 does not transpile the lib
  if (env && env.es6) {
    config = addLocalDevSettings(config, exampleDir);
  }

  // console.warn(JSON.stringify(config, null, 2)); // uncomment to debug config
  return config;
};
