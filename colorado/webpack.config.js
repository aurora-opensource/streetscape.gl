const {resolve} = require('path');
const webpack = require('webpack');

const CONFIG = {
  mode: 'development',
  entry: {
    app: resolve('./src/app.js')
  },
  devtool: 'source-maps',
  output: {
    path: resolve('./dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
        include: [resolve('.')],
        exclude: [/node_modules/],
        options: {
          objectAssign: 'Object.assign'
        }
      }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};

// This line enables bundling against src in this repo rather than installed deck.gl module
module.exports = CONFIG;
