/* eslint-disable no-process-env */
/* global process */
const {resolve} = require('path');
const webpack = require('webpack');

// Otherwise modules imported from outside this directory does not compile.
// Also needed if modules from this directory were imported elsewhere
// Seems to be a Babel bug
// https://github.com/babel/babel-loader/issues/149#issuecomment-191991686
const BABEL_CONFIG = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/proposal-class-properties']
};

const appName = process.env.appName || 'kitti';

const CONFIG = {
  entry: {
    app: resolve('./src/app.js')
  },

  output: {
    path: resolve('./dist'),
    filename: 'bundle.js'
  },

  module: {
    noParse: /(mapbox-gl)\.js$/,
    rules: [
      {
        // Compile ES2015 using bable
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: BABEL_CONFIG
          }
        ]
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules', '.']
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'xviz-config': resolve(__dirname, '../config', `xviz-config-${appName}.js`)
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ]
};

module.exports = env => {
  const config = Object.assign({}, CONFIG);

  if (env.prod) {
    // production
    Object.assign(config, {
      mode: 'production'
    });

    config.plugins = config.plugins.concat(
      new webpack.DefinePlugin({
        LOG_DIR: JSON.stringify('https://raw.githubusercontent.com/uber/streetscape.gl-data/master')
      })
    );
  } else {
    // dev
    Object.assign(config, {
      mode: 'development',
      devServer: {
        contentBase: [
          resolve(__dirname, '../../website/src/static'),
          resolve(__dirname, '../../../xviz/data/generated'),
          resolve(__dirname)
        ]
      },
      devtool: 'source-map'
    });

    config.module.rules = config.module.rules.concat({
      // Unfortunately, webpack doesn't import library sourcemaps on its own...
      test: /\.js$/,
      use: ['source-map-loader'],
      enforce: 'pre'
    });

    config.plugins = config.plugins.concat(
      new webpack.DefinePlugin({
        LOG_DIR: JSON.stringify('.')
      })
    );
  }
  return require('../webpack.config.local')(config)(env);
};
