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

import test from 'tape';

import {CheckBox} from '@streetscape.gl/monochrome';
import {
  createFormData,
  settingsToFormValues,
  updateFormValues,
  formValuesToSettings
} from '@streetscape.gl/core/components/stream-settings-panel';

const TEST_STREAMS = {
  '/vehicle_pose': {
    type: '/vehicle_pose'
  },
  '/vehicle/velocity': {
    unit: 'm/s',
    type: 'float'
  },
  '/vehicle/acceleration': {
    unit: 'm/s^2',
    type: 'float'
  },
  '/lidar/points': {
    type: 'point'
  }
};

test('StreamSettingsPanel#createFormData', t => {
  const data = createFormData(TEST_STREAMS, {});

  t.deepEquals(
    Object.keys(data),
    ['/vehicle_pose', '/vehicle', '/lidar'],
    'extracted top-level options'
  );
  t.deepEquals(
    Object.keys(data['/vehicle'].children),
    ['/vehicle/velocity', '/vehicle/acceleration'],
    'extracted nested options'
  );

  t.end();
});

test('StreamSettingsPanel#settingsToFormValues', t => {
  const data = createFormData(TEST_STREAMS, {});

  t.deepEquals(
    settingsToFormValues(data, {
      '/vehicle_pose': true,
      '/vehicle/velocity': true,
      '/vehicle/acceleration': true,
      '/lidar/points': false
    }),
    {
      '/vehicle_pose': CheckBox.ON,
      '/vehicle': CheckBox.ON,
      '/vehicle/velocity': CheckBox.ON,
      '/vehicle/acceleration': CheckBox.ON,
      '/lidar': CheckBox.OFF,
      '/lidar/points': CheckBox.OFF
    },
    'generated correct form values'
  );

  t.deepEquals(
    settingsToFormValues(data, {
      '/vehicle_pose': false,
      '/vehicle/velocity': true,
      '/vehicle/acceleration': false,
      '/lidar/points': true
    }),
    {
      '/vehicle_pose': CheckBox.OFF,
      '/vehicle': CheckBox.INDETERMINATE,
      '/vehicle/velocity': CheckBox.ON,
      '/vehicle/acceleration': CheckBox.OFF,
      '/lidar': CheckBox.ON,
      '/lidar/points': CheckBox.ON
    },
    'generated correct form values'
  );

  t.end();
});

test('StreamSettingsPanel#updateFormValues', t => {
  const data = createFormData(TEST_STREAMS, {});
  let values = {
    '/vehicle_pose': CheckBox.ON,
    '/vehicle': CheckBox.ON,
    '/vehicle/velocity': CheckBox.ON,
    '/vehicle/acceleration': CheckBox.ON,
    '/lidar': CheckBox.OFF,
    '/lidar/points': CheckBox.OFF
  };

  values = updateFormValues(data, values, {
    '/vehicle/acceleration': CheckBox.OFF
  });
  t.deepEquals(
    values,
    {
      '/vehicle_pose': CheckBox.ON,
      '/vehicle': CheckBox.INDETERMINATE,
      '/vehicle/velocity': CheckBox.ON,
      '/vehicle/acceleration': CheckBox.OFF,
      '/lidar': CheckBox.OFF,
      '/lidar/points': CheckBox.OFF
    },
    'generated correct form values'
  );

  values = updateFormValues(data, values, {
    '/vehicle/velocity': CheckBox.OFF
  });
  t.deepEquals(
    values,
    {
      '/vehicle_pose': CheckBox.ON,
      '/vehicle': CheckBox.OFF,
      '/vehicle/velocity': CheckBox.OFF,
      '/vehicle/acceleration': CheckBox.OFF,
      '/lidar': CheckBox.OFF,
      '/lidar/points': CheckBox.OFF
    },
    'generated correct form values'
  );

  values = updateFormValues(data, values, {
    '/vehicle': CheckBox.ON
  });
  t.deepEquals(
    values,
    {
      '/vehicle_pose': CheckBox.ON,
      '/vehicle': CheckBox.ON,
      '/vehicle/velocity': CheckBox.ON,
      '/vehicle/acceleration': CheckBox.ON,
      '/lidar': CheckBox.OFF,
      '/lidar/points': CheckBox.OFF
    },
    'generated correct form values'
  );

  values = updateFormValues(data, values, {
    '/vehicle_pose': CheckBox.OFF
  });
  t.deepEquals(
    values,
    {
      '/vehicle_pose': CheckBox.OFF,
      '/vehicle': CheckBox.ON,
      '/vehicle/velocity': CheckBox.ON,
      '/vehicle/acceleration': CheckBox.ON,
      '/lidar': CheckBox.OFF,
      '/lidar/points': CheckBox.OFF
    },
    'generated correct form values'
  );

  t.end();
});

test('StreamSettingsPanel#formValuesToSettings', t => {
  t.deepEquals(
    formValuesToSettings(TEST_STREAMS, {
      '/vehicle_pose': CheckBox.ON,
      '/vehicle': CheckBox.INDETERMINATE,
      '/vehicle/velocity': CheckBox.ON,
      '/vehicle/acceleration': CheckBox.OFF,
      '/lidar': CheckBox.OFF,
      '/lidar/points': CheckBox.OFF
    }),
    {
      '/vehicle_pose': true,
      '/vehicle/velocity': true,
      '/vehicle/acceleration': false,
      '/lidar/points': false
    },
    'generated correct form values'
  );

  t.end();
});
