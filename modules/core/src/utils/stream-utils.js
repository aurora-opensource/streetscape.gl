/**
 * creates a test function from a filter
 * @param filter {string|object|array<string>|function}
 *   - string: a single stream name to be allowed
 *   - array: multiple stream names to be allowed
 *   - object: stream name to true|false map
 *   - function: custom callback that returns true|false from any stream name
 * @returns a normalized test function that returns true|false from any stream name
 */
export function normalizeStreamFilter(filter) {
  if (!filter) {
    // empty - always pass
    return () => true;
  }
  if (Array.isArray(filter)) {
    return streamName => filter.includes(streamName);
  }
  switch (typeof filter) {
    case 'string':
      return streamName => streamName === filter;
    case 'function':
      return filter;
    default:
      return streamName => filter[streamName];
  }
}
