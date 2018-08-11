const {ArgumentParser} = require('argparse');
const path = require('path');

const parser = new ArgumentParser({
  addHelp: true,
  description: 'Voyage to XVIZ converter'
});

parser.addArgument(['-b', '--bag'], {
  required: true,
  help: 'Path to ROS bag'
});

parser.addArgument(['-o', '--output'], {
  help: 'Path to generated data. Relative path will be resolved relative to /data/generated/voyage/'
});

parser.addArgument(['--disable-streams'], {
  defaultValue: '',
  help: 'Comma separated stream names to disable'
});

parser.addArgument(['--frame_limit'], {
  defaultValue: Number.MAX_SAFE_INTEGER,
  help: 'Limit XVIZ frame generation to this value. Useful for testing conversion quickly'
});

// extract args from user input
module.exports = function getArgs() {
  const args = parser.parseArgs();
  const outputDir = path.resolve(
    __dirname,
    '../../../../data/generated/voyage',
    args.output || 'output'
  );
  const disableStreams = args.disable_streams.split(',');
  return {
    bag: args.bag,
    outputDir,
    disableStreams,
    frameLimit: args.frame_limit
  };
};
