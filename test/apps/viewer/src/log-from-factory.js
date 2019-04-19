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

import {XVIZFileLoader, XVIZLiveLoader, XVIZStreamLoader} from 'streetscape.gl';

class XVIZLoaderFactory {
  load(stream, live, options) {
    if (stream) {
      return this.loadStream(options);
    } else if (live) {
      return this.loadLive(options);
    }

    return this.loadFile();
  }

  loadFile() {
    return new XVIZFileLoader({
      timingsFilePath:
        'https://raw.githubusercontent.com/uber/xviz-data/master/kitti/2011_09_26_drive_0005_sync/0-frame.json',
      getFilePath: index =>
        `https://raw.githubusercontent.com/uber/xviz-data/master/kitti/2011_09_26_drive_0005_sync/${index +
          1}-frame.glb`,
      worker: true,
      maxConcurrency: 4
    });
  }

  loadStream(options) {
    return new XVIZStreamLoader(options);
  }

  loadLive(options) {
    return new XVIZLiveLoader(options);
  }
}

export default new XVIZLoaderFactory();
