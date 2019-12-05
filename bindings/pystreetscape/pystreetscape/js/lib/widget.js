import * as widgets from '@jupyter-widgets/base';
import {StreetscapeGLJupyter} from './streetscapegl/streetscape';

export const StreetscapeGLModel = widgets.DOMWidgetModel.extend({
    defaults: {
        ...widgets.DOMWidgetModel.prototype.defaults(),
        _model_name : 'StreetscapeGLModel',
        _model_module : 'streetscape-jupyter',
        _model_module_version : '0.1.0',

        _view_name : 'StreetscapeGLView',
        _view_module : 'streetscape-jupyter',
        _view_module_version : '0.1.0',

        value : 'Hello Darn World!',
        data : []
    }
});


// Custom View. Renders the widget model.
export const StreetscapeGLView = widgets.DOMWidgetView.extend({
    render() {
        try {
          this.streetscape = new StreetscapeGLJupyter();
          this.streetscape.create(this);
        } catch (err) {
          console.log(err);
        }

        this.value_changed();
        this.model.on('change:value', this.value_changed, this);

        this.data_changed();
        this.model.on('change:data', this.data_changed, this);
    },

    value_changed() {
      // this.streetscape.onValueChange(this.model.get('value'));
    },

    data_changed() {
      // this.streetscape.onDataChange(this.model.get('data'));
    }
});
