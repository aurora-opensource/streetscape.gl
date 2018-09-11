const {ArgumentParser} = require('argparse');
const path = require('path');

const parser = new ArgumentParser({
  addHelp: true,
  description: 'KITTI to XVIZ converter'
});

parser.addArgument(['-d', '--data-directory'], {
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

parser.addArgument(['--frame-limit'], {
  defaultValue: Number.MAX_SAFE_INTEGER,
  help: 'Limit XVIZ frame generation to this value. Useful for testing conversion quickly'
});

parser.addArgument(['--image-max-width'], {
  defaultValue: Number.MIN_SAFE_INTEGER,
  help: 'Image max width'
});

parser.addArgument(['--image-max-height'], {
  defaultValue: Number.MIN_SAFE_INTEGER,
  help: 'Image max height'
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
  const disabledStreams = args.disable_streams.split(',').filter(Boolean);
  return {
    inputDir,
    outputDir,
    disabledStreams,
    imageMaxWidth: Number(args.image_max_width),
    imageMaxHeight: Number(args.image_max_height),
    frameLimit: Number(args.frame_limit)
  };
};
