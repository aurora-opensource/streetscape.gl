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
import {XVIZMetadataBuilder, XVIZBuilder} from '@xviz/builder';

const INLINE_COMMENT_REGEX = /\s*\/\/.*[\n\r]/g;
const BLOCK_COMMENT_REGEX = /\s*\/\*(\*(?!\/)|[^*])*\*\//g;
const LAST_STMT_REGEX = /\s*([^;]+)\.([^;]*)/im;

const dataCompleter = {
  insertMatch: (editor, data) => {
    const {filterText} = editor.completer.completions;
    if (filterText) {
      const ranges = editor.selection.getAllRanges();
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        range.start.column -= filterText.length;
        editor.session.remove(range);
      }
    }
    editor.execCommand('insertstring', data.value);
    if (data.args.length) {
      const pos = editor.getCursorPosition();
      editor.moveCursorTo(pos.row, pos.column - 1);
    }
  }
};

export default {
  getCompletions: (editor, session, pos, prefix, callback) => {
    const lines = editor.getValue().split('\n');
    const code = lines.slice(0, pos.row).join('\n') + lines[pos.row].slice(0, pos.column);

    const lastStatement = code.slice(code.lastIndexOf(';') + 1).match(LAST_STMT_REGEX);
    if (!lastStatement) {
      return null;
    }

    const suggestions = autocomplete(lastStatement[1]);
    if (!suggestions) {
      return null;
    }
    return callback(null, suggestions);
  },

  identifierRegexps: [/^\.(.*)$/]
};

const metadataBuilder = new XVIZMetadataBuilder();
const xvizBuilder = new XVIZBuilder();

function autocomplete(code) {
  const wrappedCode = `function fn(xvizMetadataBuilder, xvizBuilder) {
    return ${removeComments(code)}
  }`;
  let instance;

  try {
    const func = eval(`(function() { return ${wrappedCode} })()`);
    instance = func(metadataBuilder, xvizBuilder);
  } catch (error) {
    // ignore
  }

  if (instance) {
    return getAutoCompleteSuggestions(instance);
  }
  return null;
}

function getAutoCompleteSuggestions(object) {
  object = object && Object.getPrototypeOf(object);

  if (!object) {
    return null;
  }

  if (object.constructor.hasOwnProperty('_autoCompleteSuggestions')) {
    return object.constructor._autoCompleteSuggestions;
  }

  const publicMethods = getPublicMethods(object);

  Object.defineProperty(object.constructor, '_autoCompleteSuggestions', {
    enumerable: false,
    value: Object.keys(publicMethods).map(name => ({
      name,
      args: publicMethods[name],
      caption: `${name}(${publicMethods[name].join(', ')})`,
      value: `.${name}()`,
      completer: dataCompleter
    }))
  });

  return object.constructor._autoCompleteSuggestions;
}

function getPublicMethods(object) {
  const proto = object && Object.getPrototypeOf(object);

  if (!proto) {
    return {};
  }

  if (object.constructor.hasOwnProperty('_publicMethods')) {
    return object.constructor._publicMethods;
  }

  const result = {};
  const properties = Object.getOwnPropertyNames(object);
  for (let i = 0; i < properties.length; i++) {
    const key = properties[i];

    if (key !== 'constructor' && key[0] !== '_' && typeof object[key] === 'function') {
      result[key] = getArguments(object[key]);
    }
  }

  Object.assign(result, getPublicMethods(proto));

  Object.defineProperty(object.constructor, '_publicMethods', {
    enumerable: false,
    value: result
  });

  return object.constructor._publicMethods;
}

function getArguments(func) {
  const source = func.toString();
  const argsList = source.match(/\(([^()]*)\)/);
  if (argsList && argsList[1]) {
    return argsList[1].split(/,\s*/);
  }
  return [];
}

function removeComments(code) {
  return code.replace(INLINE_COMMENT_REGEX, '').replace(BLOCK_COMMENT_REGEX, '');
}
