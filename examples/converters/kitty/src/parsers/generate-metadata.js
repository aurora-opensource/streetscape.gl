const fs = require('fs');

const {getTimeRange} = require('./common');

function getMetadata({startTime, endTime, streams}) {
  return {
    version: '2.0',
    type: 'metadata',
    start_time: startTime,
    end_time: endTime,
    streams: streams.reduce((resMap, stream) => {
      const {name, category, type, unit} = stream;

      resMap[name] = {category, type};
      if (unit) {
        resMap[name].unit = unit;
      }

      return resMap;
    }, {})
  };
}

function generateMetadata(timeFilePath, metaDataFilePath, streams) {
  console.log('generating metadata file');
  const {startTime, endTime} = getTimeRange(timeFilePath);
  const metadata = getMetadata({startTime, endTime, streams});
  fs.writeFileSync(metaDataFilePath, JSON.stringify(metadata, null, 2), {
    flag: 'w'
  });
}

module.exports = generateMetadata;
