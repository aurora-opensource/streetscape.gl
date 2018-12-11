/* eslint-disable no-process-env */
const {resolve} = require('path');
const webpack = require('webpack');

const ALIASES = require('../aliases');

const ROOT_DIR = resolve(__dirname, '..');

// Otherwise modules imported from outside this directory does not compile.
// Also needed if modules from this directory were imported elsewhere
// Seems to be a Babel bug
// https://github.com/babel/babel-loader/issues/149#issuecomment-191991686
const BABEL_CONFIG = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/proposal-class-properties']
};

module.exports = {
  mode: 'development',

  entry: {
    app: resolve('./src/main.js')
  },

  devtool: 'source-map',

  // suppress warnings about bundle size
  devServer: {
    stats: {
      warnings: false
    },
    contentBase: [resolve(__dirname, './src/static')]
  },

  output: {
    path: resolve('./dist'),
    filename: 'bundle.js'
  },

  resolve: {
    // https://github.com/ReactTraining/react-router/issues/6201
    modules: [resolve('./node_modules'), resolve(ROOT_DIR, './node_modules')],
    alias: ALIASES
  },

  module: {
    noParse: /(mapbox-gl)\.js$/,
    rules: [
      {
        // Compile ES2015 using babel
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
      },
      {
        test: /\.(svg|ico|gif|jpe?g|png)$/,
        loader: 'file-loader?name=[name].[ext]'
      },
      {
        // Unfortunately, webpack doesn't import library sourcemaps on its own...
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin(['MapboxAccessToken'])
  ]
};
