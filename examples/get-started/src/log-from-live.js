import {XVIZLiveLoader} from 'streetscape.gl';

export default new XVIZLiveLoader({
  logGuid: 'mock',
  bufferLength: 10,
  serverConfig: {
    defaultLogLength: 30,
    serverUrl: 'ws://localhost:8081'
  },
  worker: true,
  maxConcurrency: 4
});
