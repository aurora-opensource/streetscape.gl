require('@babel/register');

const parseArgs = require('./args');
const main = require('./transform');

main(parseArgs());
