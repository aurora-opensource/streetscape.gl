import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './app';

// TODO(twojtasz): Do I need the store?
function renderRoot({id, store, ele}) {
  const Root = () => (
    <Provider store={store}>
      <App />
    </Provider>
  );

  ReactDOM.render(<Root />, ele);
}

export default renderRoot;
