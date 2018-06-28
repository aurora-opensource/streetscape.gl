/**
 * Parse command line arguments
 */
const args = process.argv.slice(2);

function parseArgs() {
  const argMap = {};
  if (args && args.length) {
    for (let i = 0; i < args.length; i++) {
      const match = args[i].match(/--(\w+)=(.*)/);
      if (match) {
        argMap[match[1]] = match[2];
      }
    }
  }
  return argMap;
}

module.exports = parseArgs;
