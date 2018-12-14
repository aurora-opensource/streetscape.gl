/* eslint-disable no-process-env */
const {resolve} = require('path');
const webpack = require('webpack');

const BABEL_CONFIG = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/proposal-class-properties']
};

const CONFIG = {
  mode: 'development',
  entry: {
    app: resolve('./src/app.js')
  },
  devtool: 'source-map',
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

module.exports = env => {
  let config = Object.assign({}, CONFIG);

  if (env) {
    // This line enables bundling against src in this repo rather than installed module
    config = require('../webpack.config.local')(config)(env);
    // This switch between streaming and static file loading
    config.plugins = config.plugins.concat([
      new webpack.DefinePlugin({__IS_STREAMING__: JSON.stringify(Boolean(env.stream))})
    ]);
  }

  return config;
};
