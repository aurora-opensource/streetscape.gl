/* eslint-disable no-eval */
import {XVIZMetadataBuilder, XVIZBuilder, XVIZWriter} from '@xviz/builder';

const writer = new XVIZWriter({});

export function evaluateCode(code, type) {
  let builder;

  switch (type) {
    case 'metadata':
      builder = new XVIZMetadataBuilder();
      code = `function fn(xvizMetadataBuilder) {
        ${code}
        return xvizMetadataBuilder.getMetadata();
      }`;
      break;

    case 'frame':
      builder = new XVIZBuilder();
      code = `function fn(xvizBuilder) {
        ${code}
        return xvizBuilder.getFrame();
      }`;
      break;

    default:
  }

  try {
    const func = eval(`(function() { return ${code} })()`);
    const result = func(builder);

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid JSON object');
    }
    return {error: null, data: result};
  } catch (error) {
    return {error, data: null};
  }
}

export function createMessage(data, type) {
  let message = null;
  writer.sink.writeSync = (dir, filename, json) => {
    message = JSON.parse(json);
  };

  switch (type) {
    case 'metadata':
      writer.writeMetadata('', data, {writeBinary: false, writeJson: true});
      return message;

    case 'frame':
      writer.writeFrame('', 1, data, {writeBinary: false, writeJson: true});
      return message;

    default:
      return null;
  }
}
