require('@babel/register');
require('babel-polyfill');

const parseArgs = require('./args').default;
const transform = require('./transform').default;

(async function index() {
  try {
    await transform(parseArgs());
  }
  catch (err) {
    console.error(err); // eslint-disable-line
    throw err;
  }
})();
