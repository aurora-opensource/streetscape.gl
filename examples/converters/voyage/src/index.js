require('@babel/register');
require('babel-polyfill');

const parseArgs = require('./args');
const main = require('./transform');

(async function index() {
  try {
    await main(parseArgs());
  }
  catch (err) {
    console.error(err); // eslint-disable-line
    process.exit(1);
  }

  process.exit(0);
})();
