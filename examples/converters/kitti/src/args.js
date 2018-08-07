const {ArgumentParser} = require('argparse');
const path = require('path');

const parser = new ArgumentParser({
  addHelp: true,
  description: 'KITTI to XVIZ converter'
});

parser.addArgument(['-d', '--data_directory'], {
  required: true,
  help: 'Path to raw KITTI data. Relative path will be resolved relative to /data/kitti/'
});

parser.addArgument(['-o', '--output'], {
  help: 'Path to generated data. Relative path will be resolved relative to /data/generated/kitti/'
});

parser.addArgument(['--disable-streams'], {
  defaultValue: '',
  help: 'Comma separated stream names to disable'
});

// extract args from user input
module.exports = function getArgs() {
  const args = parser.parseArgs();
  const inputDir = path.resolve(__dirname, '../../../../data/kitti', args.data_directory);
  const outputDir = path.resolve(
    __dirname,
    '../../../../data/generated/kitti',
    args.out || args.data_directory
  );
  console.log(inputDir, outputDir); // eslint-disable-line
  const disableStreams = args.disable_streams.split(',').reduce((resMap, name) => {
    resMap[name] = name;
    return resMap;
  }, {});

  return {
    inputDir,
    outputDir,
    disableStreams
  };
};
