import {XVIZStreamLoader} from 'streetscape.gl';
// wss://xviz.app.uberatc.net/?log=91ca533305224254d536cd71530330a9&profile=ocs_lite_minimal
export default new XVIZStreamLoader({
  logGuid: '91ca533305224254d536cd71530330a9',
  logProfile: 'ocs_lite_minimal',
  // bufferLength: 15,
  serverConfig: {
    defaultLogLength: 30,
    serverUrl: 'wss://xviz.app.uberatc.net',
    queryParams: {
      version: '2.0'
    }
  },
  worker: true,
  maxConcurrency: 4
});
