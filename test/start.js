require('@babel/register')({
  presets: [['@babel/env', {modules: 'commonjs'}]]
});

const {resolve} = require('path');

// Registers aliases for virtual packages in this module
require('source-map-support').install();

const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  'test-data': resolve(__dirname, 'data'),
  'streetscape.gl': resolve(__dirname, '../modules/core/src')
});

require('./index');
