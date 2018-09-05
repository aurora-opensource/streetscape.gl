// pre process data, e.g. scale image
require('@babel/register');

const parseArgs = require('./args');
const {processImage} = require('./parsers/process-image');

processImage(parseArgs());
