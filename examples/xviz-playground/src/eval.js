// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable no-eval */
import {XVIZMetadataBuilder, XVIZBuilder, XVIZWriter} from '@xviz/builder';

class DataSink {
  message = null;

  writeSync(dir, filename, json) {
    this.message = JSON.parse(json);
  }
}
const dataSink = new DataSink();

const writer = new XVIZWriter({dataSink, binary: false, json: true});

export function evaluateCode(code, type) {
  let Builder;
  let wrappedCode;

  switch (type) {
    case 'metadata':
      Builder = XVIZMetadataBuilder;
      wrappedCode = `function fn(xvizMetadataBuilder) {
        ${code}
        return xvizMetadataBuilder.getMetadata();
      }`;
      break;

    case 'frame':
      Builder = XVIZBuilder;
      wrappedCode = `function fn(xvizBuilder) {
        ${code}
        return xvizBuilder.getFrame();
      }`;
      break;

    default:
  }

  try {
    const func = eval(`(function() { return ${wrappedCode} })()`);
    const result = func(new Builder());

    if (!result || typeof result !== 'object') {
      throw new Error('Invalid JSON object');
    }
    return {error: null, data: result};
  } catch (error) {
    return {error, data: null};
  }
}

// TODO(twojtasz) this should use @xviz/io
export function createMessage(data) {
  // Normalize enums to uppercase
  let type = data.type && data.type;
  if (type && type.startsWith('xviz/')) {
    type = type === 'xviz/metadata' ? 'metadata' : 'frame';
    data = data.data;
  } else {
    type = data.update_type ? 'frame' : 'metadata';
  }
  switch (type) {
    case 'metadata':
      writer.writeMetadata('', data);
      return dataSink.message;

    case 'frame':
      writer.writeFrame('', 1, data);
      return dataSink.message;

    default:
      return null;
  }
}
