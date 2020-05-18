var plugin = require('../dist/lab');
var base = require('@jupyter-widgets/base');

const EXTENSION_ID = 'streetscape_avs:plugin';

// name must match _model_module in python DOMWidget
// version must match _model_module_version in python DOMWidget
module.exports = {
  id: EXTENSION_ID,
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
    widgets.registerWidget({
      name: '@streetscape/jupyter-widget',
      version: '0.1.0',
      exports: plugin
    });
  },
  autoStart: true
};
