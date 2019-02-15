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

export function getImageUrl(filename) {
  return `./images/${filename}`;
}

export const DEMO_LINK = './demo/index.html';

const XVIZ_DATA_URL = 'https://uber.github.io/xviz-data';

export const SECTIONS = [
  {
    id: 'walkthrough',
    title: 'Start building your application in three steps',
    description: 'Bring autonomous vehicle data to life for inspection.',
    isDark: true
  },
  {
    id: 'elements',
    title: 'Tangible Data',
    description: 'Gain data insights in context.'
  },
  {
    id: 'features',
    title: 'Suite of Controls',
    description: 'Streamline your workflow with reusable components.',
    background: '#F8F8F9'
  },
  {
    id: 'usecases',
    title: 'Powerful Applications',
    description: 'Build for a new world powered by autonomous data.'
  }
  // {
  //   id: 'showcase',
  //   title: 'Success Stories',
  //   description: 'See what other companies have created with streetscape.gl and xviz builder.',
  //   isDark: true
  // }
];

export const DEMO_VIDEO = {
  poster: getImageUrl('demo.jpg'),
  url: `${XVIZ_DATA_URL}/kitti/video/kitti_sm.mp4`
};

export const SLIDESHOW_IMAGES = [
  getImageUrl('usecase-view.jpg'),
  getImageUrl('usecase-triage.jpg'),
  getImageUrl('usecase-debug.jpg')
];

export const SHOWCASE_ITEMS = [
  {
    title: 'Kitty',
    image: getImageUrl('demo-kitti.png'),
    description:
      'Kitti dataset is an open sourced autonomous driving log data including vehicle location, orientation, and metrics, objects classified with bounds (tracklets), camera imagery, and lidar scans'
  },
  {
    title: 'NuTonomy',
    image: getImageUrl('demo-nutonomy.png'),
    description:
      'The nuScenes dataset is a public large-scale dataset for autonomous driving provided by nuTonomy-Aptiv.'
  }
];

export const ELEMENTS = [
  {
    title: 'Maps',
    description: 'Geospatial context including roads, lanes, traffic lights, and signs.',
    icon: 'data_map'
  },
  {
    title: 'Sensors',
    description: 'High-precision 3D LIDAR point clouds, radar returns and ultrasonic echos.',
    icon: 'data_lidar'
  },
  {
    title: 'Cameras',
    description: 'Video feeds of the surrounding environment.',
    icon: 'data_camera'
  },
  {
    title: 'Metrics',
    description: 'Rich measurements from devices and software onboard the vehicle.',
    icon: 'data_metric'
  },
  {
    title: 'Actions',
    description:
      'Machine learning powered decision making process behind perception, prediction, and motion planning.',
    icon: 'data_ML'
  },
  {
    title: 'Events',
    description: 'Machine and human flagged events for future investigation.',
    icon: 'data_event'
  }
];

export const STEPS = [
  {
    title: 'Convert',
    description: 'Convert data into the XVIZ protocol.',
    link: {
      title: 'XVIZ Overview',
      url: '#/xviz'
    }
  },
  {
    title: 'Visualize',
    description:
      'Visualize your converted data as 3D scenes, plots and more using the streetscape.gl framework.',
    link: {
      title: 'streetscape.gl Overview',
      url: '#/streetscape.gl'
    }
  },
  {
    title: 'Explore',
    description:
      'Interact, inspect and drive insights with your data in a custom, autonomous-specific workflow.',
    link: {
      title: 'Try the demo application',
      // TODO update url when data repo is ready
      url: DEMO_LINK
    }
  }
];

export const VIS_LOGO = getImageUrl('viz_logo_bw.png');
export const UBER_LOGO = getImageUrl('uber-logo.png');
export const ATG_LOGO = getImageUrl('atg-logo.png');
export const AI_LOGO = getImageUrl('AppliedIntuition_wht.svg');
export const STREETSCAPE_GL_LOGO = getImageUrl('logo.png');
export const HERO_BACKGROUND = getImageUrl('hero-background.gif');
