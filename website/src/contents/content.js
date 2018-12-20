// Copyright (c) 2018 Uber Technologies, Inc.
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
    description: 'Gain data insights.'
  },
  {
    id: 'features',
    title: 'Suite of Controls',
    description: 'Streamline your workflow with reusable components.',
    background: '#F8F8F9'
  },
  {
    id: 'showcase',
    title: 'Success Stories',
    description: 'See what other companies have created with streetscape.gl and xviz builder.',
    isDark: true
  }
];

export const HERO_IMAGES = [getImageUrl('example-demoapp.png'), getImageUrl('example-mapping.png')];

// TODO replace with scaled images
export const HERO_IMAGES_SCALED = [
  getImageUrl('example-demoapp.png'),
  getImageUrl('example-mapping.png')
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
    description: 'Persistent Geo-Spatial elements like traffic lights, stop, signs...',
    image: getImageUrl('data-map.png'),
    icon: 'data_icon_map'
  },
  {
    title: 'Lidar',
    description: 'Use to reconstruct 3D world with more precision',
    image: getImageUrl('data-lidar.png'),
    icon: 'data_icon_lidar'
  },
  {
    title: 'ML',
    description: 'AI helps detect lane lines and identify cyclists.',
    image: getImageUrl('data-ML.png'),
    icon: 'data_icon_ML'
  },
  {
    title: 'Camera',
    description:
      'Discover things like lane lines on the highway, speed signs, and traffic lights...',
    image: getImageUrl('data-videocamera.png'),
    icon: 'data_icon_videocamera'
  },
  {
    title: 'Radar',
    description: 'Spot big metallic objects-other vehicles.',
    image: getImageUrl('data-radar.png'),
    icon: 'data_icon_radar'
  }
];

export const STEPS = [
  {
    title: 'Convert',
    description: 'Convert data into the XVIZ protocol.',
    link: {
      title: 'Explore XVIZ',
      url: 'https://github.com/uber/xviz'
    }
  },
  {
    title: 'Visualize',
    description:
      'Render your converted data using the streetscape.gl framework (part of the deck.gl family).',
    link: {
      title: 'Explore streetscape.gl',
      url: 'https://github.com/uber/streetscape.gl'
    }
  },
  {
    title: 'Explore',
    description:
      'Interact, inspect and drive insights with your data in a custom, autonomous-specific workflow.',
    link: {
      title: 'Explore the triage demo application',
      // TODO update url when data repo is ready
      url: DEMO_LINK
    }
  }
];

export const VIS_LOGO = getImageUrl('viz_logo_bw.png');
export const UBER_LOGO = getImageUrl('uber-logo.png');
export const STREETSCAPE_GL_LOGO = getImageUrl('logo.png');
export const HERO_BACKGROUND = getImageUrl('hero-background.png');
