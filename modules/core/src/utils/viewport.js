import WebMercatorViewport from 'viewport-mercator-project';
import {MapView, FirstPersonView} from 'deck.gl';

export function getViewStateOffset(oldViewState, viewState, oldOffset) {
  if (!oldViewState) {
    return oldOffset;
  }

  const oldViewport = new WebMercatorViewport(oldViewState);
  const oldPos = [oldViewport.width / 2 + oldOffset.x, oldViewport.height / 2 + oldOffset.y];
  const trackedLngLat = oldViewport.unproject(oldPos);

  const newViewport = new WebMercatorViewport(viewState);
  const newPos = newViewport.project(trackedLngLat);

  return {
    x: oldOffset.x + newPos[0] - oldPos[0],
    y: oldOffset.y + newPos[1] - oldPos[1],
    bearing: oldOffset.bearing + viewState.bearing - oldViewState.bearing
  };
}

// Adjust lng/lat to position the car 1/4 from screen bottom
function offsetViewState(viewState, offset) {
  const shiftedViewState = {
    ...viewState,
    bearing: viewState.bearing + offset.bearing
  };

  const helperViewport = new WebMercatorViewport(shiftedViewState);

  const pos = [viewState.width / 2 + offset.x, viewState.height / 2 + offset.y];
  const lngLat = [viewState.longitude, viewState.latitude];

  const [longitude, latitude] = helperViewport.getLocationAtPoint({
    lngLat,
    pos
  });

  return {
    ...shiftedViewState,
    longitude,
    latitude
  };
}

export function getViews(viewMode) {
  const {name, orthographic, firstPerson, mapInteraction} = viewMode;

  const controllerProps = {...mapInteraction, keyboard: false};

  if (firstPerson) {
    return new FirstPersonView({
      id: name,
      fovy: 75,
      near: 1,
      far: 10000,
      focalDistance: 10,
      controller: controllerProps
    });
  }

  return new MapView({
    id: name,
    orthographic,
    controller: controllerProps
  });
}

// Creates viewports that contains information about car position and heading
export function getViewStates({viewState, trackedPosition, viewMode, offset}) {
  const {name, firstPerson} = viewMode;

  const viewStates = {};

  if (firstPerson) {
    if (trackedPosition) {
      const bearing = 90 - trackedPosition.bearing;
      viewState = {
        ...viewState,
        ...firstPerson,
        longitude: trackedPosition.longitude,
        latitude: trackedPosition.latitude,
        bearing: 90 - bearing + offset.bearing
      };
    }
    viewStates[name] = viewState;
  } else {
    viewStates[name] = offsetViewState({...viewState, ...trackedPosition}, offset);
  }

  return viewStates;
}
/* eslint-enable max-params */
