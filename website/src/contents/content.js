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
    title: '80-20',
    description: 'We take care of 80% of the legwork. Customize your app for your workflow.',
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
    id: 'tutorials',
    title: 'Golden Standard',
    description: 'Accelerate work with ready Visualization Template.',
    isDark: true
  },
  {
    id: 'showcase',
    title: 'Success Stories',
    description: 'See what other companies have created with streetscape.gl and xviz builder.',
    isDark: true
  }
];

export const HERO_IMAGES = [
  getImageUrl('example-demoapp.png'),
  getImageUrl('example-mapping.png'),
  getImageUrl('example-remoteassist.png')
];

// TODO replace with scaled images
export const HERO_IMAGES_SCALED = [
  getImageUrl('example-demoapp.png'),
  getImageUrl('example-mapping.png'),
  getImageUrl('example-remoteassist.png')
];

export const SHOWCASE_ITEMS = [
  {
    text: 'Kitty',
    image: getImageUrl('example-demoapp.png')
  },
  {
    text: 'Voyage',
    image: getImageUrl('example-mapping.png')
  },
  {
    text: 'Uber',
    image: getImageUrl('example-remoteassist.png')
  }
];

export const FEATURES = [
  {
    title: 'Camera',
    images: [getImageUrl('ui-camera.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'Tree',
    images: [getImageUrl('ui-treetable.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'Metric',
    images: [getImageUrl('ui-metric.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'Obj Markers',
    images: [getImageUrl('ui-obj-markers.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'Telemetry',
    images: [getImageUrl('ui-telemetry.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'Plot',
    images: [getImageUrl('ui-plot.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'HUD',
    images: [getImageUrl('ui-hud.png')],
    icon: 'solid_polygon'
  },
  {
    title: 'Playback',
    images: [getImageUrl('ui-playbackcontrol.png')],
    icon: 'solid_polygon'
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

export const TUTORIALS = [
  {
    text: 'Traffic Lights',
    image: getImageUrl('vis-trafficlights.png')
  },
  {
    text: 'Perception data - actors the car sees',
    image: getImageUrl('vis-objects.png')
  },
  {
    text: 'Trajectory',
    image: getImageUrl('vis-trajectory.png')
  }
];

export const STEPS = [
  {
    title: 'Convert',
    description: 'Convert data following XVIZ protocols. Lorem ipsum dolor sit amet, consectetur',
    link: {
      title: 'Explore XVIZ',
      url: 'https://github.com/uber/xviz'
    }
  },
  {
    title: 'Visualize',
    description:
      'Render your converted data using streetscape.gl APIs. Lorem sit amet, consectetur.',
    link: {
      title: 'Explore OSS',
      url: 'https://github.com/uber/streetscape.gl'
    }
  },
  {
    title: 'Inspect',
    description: 'Interact, explore and inspect your sdv development. Lorem sit amet, consectetur.',
    link: {
      title: 'Try demo',
      url: 'https://github.com/uber/streetscape.gl'
    }
  }
];

export const VIS_LOGO = getImageUrl('viz_logo_bw.png');
export const UBER_LOGO = getImageUrl('uber-logo.png');
export const STREETSCAPE_GL_LOGO = getImageUrl('logo.png');
export const HERO_BACKGROUND = getImageUrl('hero-background.png');
