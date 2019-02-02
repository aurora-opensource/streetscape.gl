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

export const COORDINATE = {
  GEOGRAPHIC: 'GEOGRAPHIC',
  VEHICLE_RELATIVE: 'VEHICLE_RELATIVE',
  IDENTITY: 'IDENTITY',
  DYNAMIC: 'DYNAMIC'
};

export const DEFAULT_VIEW_STATE = {
  minZoom: 12,
  maxZoom: 24,
  minPitch: 0,
  maxPitch: 0,
  bearing: 0,
  pitch: 0,
  zoom: 20
};

export const VIEW_MODE = {
  TOP_DOWN: {
    name: 'top-down',
    initialViewState: {},
    orthographic: true,
    tracked: {
      position: true
    }
  },
  PERSPECTIVE: {
    name: 'perspective',
    initialViewState: {
      maxPitch: 85,
      pitch: 60
    },
    tracked: {
      position: true,
      heading: true
    }
  },
  DRIVER: {
    name: 'driver',
    initialProps: {
      maxPitch: 0
    },
    firstPerson: {
      position: [0, 0, 1.5]
    },
    mapInteraction: {
      dragPan: false,
      scrollZoom: false
    }
  }
};
