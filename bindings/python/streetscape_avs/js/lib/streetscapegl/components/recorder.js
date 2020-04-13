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
/* global document, Blob, URL, navigator */
import React, {PureComponent} from 'react';
import {Button, Tooltip} from '@streetscape.gl/monochrome';
import {PhotoCameraIcon, PhotoCameraAddIcon, StopIcon} from './icons';

let VideoCount = 0;
const VideoPrefix = 'XvizVideo-';

export class Recorder extends PureComponent {
  state = {
    recording: false,
    recorder: null,
    recorderOptions: {
      bitsPerSecond: 4 * 1024 * 1024
    },
    recorderConstraints: {
      audio: false,
      video: {
        cursor: "always",
        frameRate: 30
      }
    }
  };
  
  _saveVideo(e) {
    const videoData = [ e.data ];
    const blob = new Blob(videoData, { 'type': 'video/webm;codecs=vp9' });
    const videoURL = URL.createObjectURL(blob);

    // this will create a link tag on the fly
    // <a href="..." download>
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${VideoPrefix}${VideoCount}`);
    VideoCount++;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  _startRecording(stream) {
    let recordingCheck = setInterval(() => {
      if (!stream.active) {
        this._stopRecording();
      }
    }, 1000);

    let recorder = new MediaRecorder(stream, this.recorderOptions);
    recorder.addEventListener('dataavailable', e => this._saveVideo(e));
    recorder.start();

    this.setState({recorder, recording: true, recordingCheck});
  }

  _stopRecording() {
    let { recorder, recordingCheck } = this.state;
    if (recordingCheck) {
      clearInterval(recordingCheck);
    }
    recorder.stop();
    this.setState({recorder: null, recording: false, recordingCheck: null});
  }

  _getStreamWindow() {
    return new Promise((res, rej) => {
      try {
        res(navigator.mediaDevices.getDisplayMedia(this.state.recorderConstraints));
      } catch(error) {
        rej(error);
      }
    });
  }

  _getStreamCanvas() {
    return new Promise((res, rej) => {
      const canvas = document.getElementById('deckgl-overlay');
      if (!canvas) {
        rej(new Error('deckgl-overlay element not found'));
      } else {
        res(canvas.captureStream(30));
      }
    });
  }

  _onToggleCanvas = () => this._onToggleRecording('canvas');
  _onToggleWindow = () => this._onToggleRecording('window');
  
  _onToggleRecording(type) {
    let { recording } = this.state;

    recording = !recording;
    if (recording) {
      const streamPromise = type === 'canvas' ? this._getStreamCanvas() : this._getStreamWindow();
      streamPromise
        .then(stream => {
          this._startRecording(stream);
        });
    } else {
      this._stopRecording();
    }
  };
 
  render() {
    const isRec = this.state.recording;
    let canvasLabel = isRec ? "Stop" : "Record Canvas";
    let windowLabel = isRec ? "Stop" : "Record Window";

    return (
      <div id="canvas-recorder">
        <Tooltip content={canvasLabel}>
          <Button onClick={this._onToggleCanvas}>
            { isRec ? <StopIcon /> : <PhotoCameraIcon />}
          </Button>
        </Tooltip>
        <Tooltip content={windowLabel}>
          <Button onClick={this._onToggleWindow}>
            { isRec ? <StopIcon /> : <PhotoCameraAddIcon />}
          </Button>
        </Tooltip>
      </div>
    );
  }
}
