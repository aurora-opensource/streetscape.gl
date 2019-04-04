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
import 'brace/theme/tomorrow';
import 'brace/theme/tomorrow_night';
import 'brace/ext/language_tools';

import {getCodeSample} from './code-samples';
import {evaluateCode, createMessage} from './eval';
import completer from './auto-complete';

const {EditSession} = ace.acequire('ace/edit_session');
const LanguageTools = ace.acequire('ace/ext/language_tools');

// Parse default settings from query parameters
/* global location, URLSearchParams */
const urlParams = new URLSearchParams(location.search);
const sampleStreams = urlParams.get('sample_streams') || 'circle,polygon';
const defaultTab = urlParams.get('tab') || 'frame';

const codeSample = getCodeSample(sampleStreams.split(','));

export default class Editor extends PureComponent {
  state = {
    activeEditor: 'javascript-editor',
    data: null,
    error: null,
    tab: ''
  };

  componentDidMount() {
    const jsEditor = this._createEditor('javascript-editor');
    this._jsEditor = jsEditor;
    // behavior
    jsEditor.setOptions({
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true
    });
    LanguageTools.setCompleters([completer]);
    // events
    jsEditor.on('change', debounce(this._evaluateJS, 500));

    const jsonEditor = this._createEditor('json-editor');
    this._jsonEditor = jsonEditor;
    // behavior
    jsonEditor.getSession().setMode('ace/mode/json');
    jsonEditor.renderer.setOption('showLineNumbers', false);
    // events
    jsonEditor.on('change', debounce(this._evaluateJSON, 500));

    // push initial messages
    this._evaluateAndPush(codeSample.metadata, 'metadata');
    this._evaluateAndPush(codeSample.frame, 'frame');

    // activate tab
    this._gotoTab(defaultTab);
  }

  _activeEditor = null;
  _jsEditor = null;
  _jsonEditor = null;
  _sessions = {
    metadata: new EditSession(codeSample.metadata),
    frame: new EditSession(codeSample.frame)
  };
  _refs = {
    'javascript-editor': React.createRef(),
    'json-editor': React.createRef()
  };
  _error = null;

  _evaluateAndPush(code, type) {
    const {data} = evaluateCode(code, type);
    this.props.log.push(createMessage(data));
  }

  _evaluateJS = () => {
    const code = this._jsEditor.getValue();
    const result = evaluateCode(code, this.state.tab);

    const jsonEditor = this._jsonEditor;
    const consoleOutput = result.data ? JSON.stringify(result.data, null, 2) : 'Invalid output';

    jsonEditor.setValue(consoleOutput, 0);
    jsonEditor.clearSelection();
    this.setState(result);
  };

  _evaluateJSON = () => {
    const json = this._jsonEditor.getValue();
    let data = null;
    let error = null;
    try {
      data = JSON.parse(json);
    } catch (e) {
      error = e;
    } finally {
      this.setState({data, error});
    }
  };

  _onFocus(editor) {
    const {_activeEditor} = this;
    if (_activeEditor) {
      _activeEditor.setTheme('ace/theme/tomorrow_night');
      _activeEditor.container.classList.remove('active');
    }
    editor.setTheme('ace/theme/tomorrow');
    editor.container.classList.add('active');
    this._activeEditor = editor;

    this.setState({activeEditor: editor.container.id});
  }

  _gotoTab(tab) {
    this.setState({tab}, () => {
      const session = this._sessions[tab];
      session.setMode('ace/mode/javascript');
      this._jsEditor.setSession(session);
      this._evaluateJS();
      this._onFocus(this._jsEditor);
    });
  }

  _onPush = () => {
    const {log} = this.props;
    const message = createMessage(this.state.data);
    log.push(message);

    // auto increment
    if (this._activeEditor === this._jsEditor && this.state.tab === 'frame') {
      const code = this._jsEditor.getValue();
      const ts = code.match(/const timestamp =\s*([\d\.]+)/);
      if (ts) {
        const newTimestamp = parseFloat(ts[1]) + 0.1;
        this._jsEditor.setValue(
          code.replace(
            /const timestamp =\s*([\d\.]+)/,
            `const timestamp = ${newTimestamp.toFixed(1)}`
          )
        );
        this._jsEditor.clearSelection();
      }
    }
  };

  _createEditor(id) {
    const container = this._refs[id].current;
    const editor = ace.edit(container);
    editor.$blockScrolling = Infinity;
    editor.setTheme('ace/theme/tomorrow_night');
    // events
    editor.container.addEventListener('transitionend', () => editor.resize());
    editor.on('focus', debounce(() => this._onFocus(editor)));
    return editor;
  }

  _renderEditor(id) {
    return <div id={id} ref={this._refs[id]} className="editor" />;
  }

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

  loadFrame(timestamp) {
    const frame = this.props.log.getFrame(timestamp);

    if (frame) {
      this._onFocus(this._jsonEditor);
      this._jsonEditor.setValue(JSON.stringify(frame.data, null, 2));
      this._jsonEditor.clearSelection();
    }
  }

  render() {
    const {isVisible} = this.props;
    const {error, activeEditor} = this.state;

    return (
      <div className={isVisible ? 'panel' : 'panel hidden'} id="edit">
        <div className={`tabs ${activeEditor === 'javascript-editor' ? '' : 'disabled'}`}>
          {Object.keys(this._sessions).map(this._renderTab, this)}
        </div>
        {this._renderEditor('javascript-editor')}
        {this._renderEditor('json-editor')}
        <div className={`push-btn ${error ? 'error' : ''}`} onClick={this._onPush}>
          {error ? error.message : `PUSH`}
        </div>
      </div>
    );
  }
}
