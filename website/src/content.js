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
    description:
      'Streamline your workflow with reusable components.',
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
  'example-demoapp.png',
  'example-mapping.png',
  'example-remoteassist.png'
];

// TODO replace with scaled images
export const HERO_IMAGES_SCALED = [
  'example-demoapp.png',
  'example-mapping.png',
  'example-remoteassist.png'
];

export const HEADER_NAVS = [
  {
    text: 'User Guide',
    link: 'https://github.com/uber/streetscape.gl/blob/master/docs/develop.md'
  },

  {
    text: 'Github',
    link: 'https://github.com/uber/streetscape.gl'
  }
];

export const SHOWCASE_ITEMS = [
  {
    text: 'Kitty',
    image: 'example-demoapp.png'
  },
  {
    text: 'Voyage',
    image: 'example-mapping.png'
  },
  {
    text: 'Uber',
    image: 'example-remoteassist.png'
  }
];

export const FEATURES = [
  {
    title: 'Camera',
    images: ['ui-camera.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'Tree',
    images: ['ui-treetable.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'Metric',
    images: ['ui-metric.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'Obj Markers',
    images: ['ui-obj-markers.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'Telemetry',
    images: ['ui-telemetry.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'Plot',
    images: ['ui-plot.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'HUD',
    images: ['ui-hud.png'],
    icon: 'solid-polygon'
  },
  {
    title: 'Playback',
    images: ['ui-playbackcontrol.png'],
    icon: 'solid-polygon'
  }
];

export const ELEMENTS = [
  {
    title: 'Maps',
    description: 'Persistent Geo-Spatial elements like traffic lights, stop, signs...',
    image: 'data-map.png',
    icon: 'data-icon-map'
  },
  {
    title: 'Lidar',
    description: 'Use to reconstruct 3D world with more precision',
    image: 'data-lidar.png',
    icon: 'data-icon-lidar'
  },
  {
    title: 'ML',
    description: 'AI helps detect lane lines and identify cyclists.',
    image: 'data-ML.png',
    icon: 'data-icon-ML'
  },
  {
    title: 'Camera',
    description: 'Discover things like lane lines on the highway, speed signs, and traffic lights...',
    image: 'data-videocamera.png',
    icon: 'data-icon-videocamera'
  },
  {
    title: 'Radar',
    description: 'Spot big metallic objects-other vehicles.',
    image: 'data-radar.png',
    icon: 'data-icon-radar'
  }
];

export const TUTORIALS = [
  {
    text: 'Traffic Lights',
    image: 'vis-trafficlights.png'
  },
  {
    text: 'Perception data - actors the car sees',
    image: 'vis-objects.png'
  },
  {
    text: 'Trajectory',
    image: 'vis-trajectory.png'
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
    description: 'Render your converted data using streetscape.gl APIs. Lorem sit amet, consectetur.',
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
