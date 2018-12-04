import test from 'tape';

import {CheckBox} from 'monochrome-ui';
import {
  createFormData,
  settingsToFormValues,
  updateFormValues,
  formValuesToSettings
} from 'streetscape.gl/components/stream-settings-panel';

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
