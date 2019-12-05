import React, {useEffect, useState, useRef} from 'react';
import {StreetscapeJupyter} from './component';

export const KEPLER_GL_JUPYTER_VERSION = "__PACKAGE_VERSION__";

// const MAPBOX_TOKEN = process.env.MapboxAccessTokenJupyter; // eslint-disable-line
const MAPBOX_TOKEN = 'pk.eyJ1IjoidGltb3RoeS13b2p0YXN6ZWsiLCJhIjoiY2pwa2l0NzYyMDN3MjQycDV2d2ZpcjRtNyJ9.N3ZPx2knZh5cwXz2hxIVKQ'

function App() {

  const rootElm = useRef(null);
  const [windowDimension, setDimension] = useState({});

  const handleResize = () => {
    if (!rootElm.current) {
      return;
    }

    const width = rootElm.current.offsetWidth;
    const height = rootElm.current.offsetHeight;
    const dimensionToSet = {
      ...(width && width !== windowDimension.width ? {width} : {}),
      ...(height && height !== windowDimension.height ? {height} : {})
    };

    setDimension(dimensionToSet);
  };

  // in Jupyter Lab,  parent component has transition when window resize.
  // need to delay call to get the final parent width,
  const resizeDelay = () => window.setTimeout(handleResize, 500);

  useEffect(() => {
    window.addEventListener('resize', resizeDelay);
    return () => window.removeEventListener('resize', resizeDelay);
  }, []);

  return (
    <div
      style={{width: '100%', height: `100%`}}
      ref={rootElm}
      className="streetscapegl-widget-container"
    >
      <StreetscapeJupyter mapbox={MAPBOX_TOKEN} />
    </div>
  );
}

export default App;
