import document from 'global/document';

import renderRoot from './components/root';

const getData = that => that.model.get('data');
const getHeight = that => that.model.get('height');

const DOM_EL_ID = 'streetscapegl';
let counter = 0;

export class StreetscapeGLJupyter {
  constructor() {
    this.id = `${DOM_EL_ID}-${counter}`;
    counter++;
    this.mapUpdateCounter = 0;
  }

  create(that) {
    this.store = {};
    const config = null;

    const height = 600; // getHeight(that);

    that.el.classList.add('jupyter-widgets');
    that.el.classList.add('streetscapegl-jupyter-widgets');

    const divElmt = document.createElement('div');
    divElmt.setAttribute('id', this.id);
    divElmt.classList.add('streetscape-gl');
    divElmt.setAttribute('style', ` width: 100%; height: ${height}px;`);
    that.el.appendChild(divElmt);

    renderRoot({id: this.id, store: this.store, ele: divElmt});
    const data = getData(that);

    // After rendering the component,
    // we add the data that's already in the model
    const hasData = data && Object.keys(data).length;
    const hasConfig = config && config.version;

    if (hasData) {
      // store.dispatch(action)
    } else if (hasConfig) {
      this.onConfigChange(that);
    }
  }

  onDataChange(that) {
    const data = getData(that);

    // store.dispatch(action)
  }

  onConfigChange(that) {
    const config = getConfig(that);

    const currentValue = getConfigInStore({hash: true, store: this.store});
    if (currentValue === JSON.stringify(config)) {
      // calling model.set('config') inside the js component will trigger another onConfigChange
      return;
    }

    this.store.dispatch(
      addDataToMap({
        // reuse datasets in state
        // a hack to apply config to existing data
        datasets: Object.values(getDatasetsInStore(this.store)).map(d => ({
          info: {
            id: d.id,
            label: d.label,
            color: d.color
          },
          data: {
            fields: d.fields,
            rows: d.allData
          }
        })),
        config,
        options: {centerMap: false}
      })
    );
  }
}
