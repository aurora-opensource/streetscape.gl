const {resolve} = require('path');
const webpack = require('webpack');

const CONFIG = {
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
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      webworkify$: resolve(__dirname, './node_modules/webworkify-webpack'),
      // TODO - remove when xviz is fixed
      "@uber/request-utils": resolve(__dirname, "./node_modules/@uber/request-utils")
    }
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = CONFIG;
