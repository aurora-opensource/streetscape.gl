var plugin = require('./index');
var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'streetscape-jupyter',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'streetscape-jupyter',
          version: plugin.version,
          exports: plugin
      });
  },
  autoStart: true
};

