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

import React, {PureComponent} from 'react';
import debounce from 'debounce';

import ace from 'brace';
import 'brace/mode/javascript';
import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import {CODE_SAMPLE_METADATA, CODE_SAMPLE_FRAME} from './constants';
import {evaluateCode, createMessage} from './eval';
import completer from './auto-complete';

const {Range} = ace.acequire('ace/range');
const {EditSession} = ace.acequire('ace/edit_session');
const LanguageTools = ace.acequire('ace/ext/language_tools');

export default class Editor extends PureComponent {
  state = {
    data: null,
    error: null,
    tab: ''
  };

  componentDidMount() {
    const editor = ace.edit(this._editorRef.current);
    editor.setTheme('ace/theme/monokai');
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    });
    LanguageTools.setCompleters([completer]);
    editor.on('change', debounce(this._evaluate, 500));
    editor.$blockScrolling = Infinity;
    this._editor = editor;

    const console_ = ace.edit(this._consoleRef.current);
    console_.getSession().setMode('ace/mode/json');
    console_.setTheme('ace/theme/monokai');
    console_.setReadOnly(true);
    console_.$blockScrolling = Infinity;
    console_.setHighlightActiveLine(false);
    console_.renderer.setOption('showLineNumbers', false);
    this._console = console_;

    this._gotoTab('metadata');
  }

  _editorRef = React.createRef();
  _consoleRef = React.createRef();

  _editor = null;
  _sessions = {
    metadata: new EditSession(CODE_SAMPLE_METADATA),
    frame: new EditSession(CODE_SAMPLE_FRAME)
  };
  _console = null;
  _error = null;

  _evaluate = () => {
    const code = this._editor.getValue();
    const result = evaluateCode(code, this.state.tab);

    const console_ = this._console;
    const consoleOutput = result.data ? JSON.stringify(result.data, null, 2) : result.error.message;

    console_.setValue(consoleOutput, 0);
    console_.clearSelection();

    if (!this._error && result.error) {
      this._error = console_.session.addMarker(new Range(0, 0, 1, 0), 'editor-error', 'fullLine');
    } else if (this._error && !result.error) {
      console_.session.removeMarker(this._error);
      this._error = null;
    }

    this.setState(result);
  };

  _gotoTab(tab) {
    this.setState({tab}, () => {
      const session = this._sessions[tab];
      session.setMode('ace/mode/javascript');
      this._editor.setSession(session);
      this._evaluate();
    });
  }

  _onPush = () => {
    const {log} = this.props;
    const message = createMessage(this.state.data, this.state.tab);
    log.push(message);

    // auto increment
    const code = this._editor.getValue();
    const ts = code.match(/const timestamp =\s*([\d\.]+)/);
    if (ts) {
      const newTimestamp = parseFloat(ts[1]) + 0.1;
      this._editor.setValue(
        code.replace(
          /const timestamp =\s*([\d\.]+)/,
          `const timestamp = ${newTimestamp.toFixed(1)}`
        )
      );
      this._editor.clearSelection();
    }
  };

  _renderTab(name) {
    return (
      <div
        key={name}
        className={`tab ${name === this.state.tab ? 'active' : ''}`}
        onClick={() => this._gotoTab(name)}
      >
        {name}
      </div>
    );
  }

  render() {
    const {tab, error} = this.state;

    return (
      <div className="editor">
        <div className="tabs">{Object.keys(this._sessions).map(this._renderTab, this)}</div>
        <div className="javascript-editor" ref={this._editorRef} />
        <div className="javascript-console" ref={this._consoleRef} />
        <div className={`push-btn ${error ? 'disabled' : ''}`} onClick={this._onPush}>
          push {tab}
        </div>
      </div>
    );
  }
}
