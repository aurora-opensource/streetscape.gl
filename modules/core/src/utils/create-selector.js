import {createSelector} from 'reselect';

// reselect selectors do not update if called with the same arguments
// to support calling them without arguments, pass logLoader version
export default function createLogSelector(logLoader, ...args) {
  const selector = createSelector(...args);
  return () => selector(logLoader._version);
}
