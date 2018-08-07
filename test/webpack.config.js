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

// Webpack 2 configuration file for running tests in browser
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {resolve} = require('path');

const TEST_DIR = './test';
const ALIASES = require('../aliases');

const TEST_BROWSER_CONFIG = {
  mode: 'development',

  devServer: {
    stats: {
      warnings: false
    },
    progress: true
  },

  // Bundle the tests for running in the browser
  entry: {
    'test-browser': resolve(TEST_DIR, 'browser.js')
  },

  devtool: '#inline-source-maps',

  resolve: {
    alias: ALIASES
  },

  module: {
    rules: [
      {
        // Compile ES2015 using buble
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      }
    ]
  },

  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },

  plugins: [new HtmlWebpackPlugin()]
};

module.exports = TEST_BROWSER_CONFIG;
