/* polyfill */
/* global self, global */
const _global = typeof global === 'undefined' ? self : global;
if (!_global.requestAnimationFrame) {
  _global.requestAnimationFrame = callback => _global.setTimeout(callback, 0);
}

import './components';
import './loaders';
import './utils';
