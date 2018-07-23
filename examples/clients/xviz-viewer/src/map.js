import React, {PureComponent} from 'react';
import {StaticMap} from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, MapView, MapController} from 'deck.gl';
import MeshLayer from '@deck.gl/experimental-layers/dist/mesh-layer/mesh-layer';
import {XvizStyleParser} from '@uber/xviz';

import {MAP_STYLE, XVIZ_STYLES} from './constants';
import {loadOBJMesh} from './utils/data-loader';
import XvizLayer from './layers/xviz-layer';

const CAR_DATA = [[0, 0, 0]];
const LIGHT_SETTINGS = {
  lightsPosition: [0, 0, 5000, -100, 40, 1000],
  ambientRatio: 0.5,
  diffuseRatio: 0.2,
  specularRatio: 0.4,
  lightsStrength: [1.0, 0.0, 1.0, 0.0],
  numberOfLights: 2
};

export default class Example extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 18,
        pitch: 20,
        bearing: 0
      },
      styleParser: new XvizStyleParser(XVIZ_STYLES),
      carMesh: null
    };

    this._onViewportChange = this._onViewportChange.bind(this);
    loadOBJMesh('./assets/car.obj').then(carMesh => this.setState({carMesh}));
  }

  _onViewportChange(viewState) {
    this.setState({viewState});
  }

  _getLayers() {
    const {features, heading, carPosition, transformMatrix} = this.props;
    const {styleParser, carMesh} = this.state;

    const coordinateProps = {
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: [carPosition.longitude, carPosition.latitude],
      modelMatrix: transformMatrix
    };

    // TODO
    return [
      carMesh &&
        new MeshLayer({
          id: 'car',
          ...coordinateProps,
          // Adjust for car center position relative to GPS/IMU
          // http://www.cvlibs.net/datasets/kitti/setup.php
          modelMatrix: transformMatrix.clone().translate([1.08, -0.32, 0]),
          mesh: carMesh,
          // OBJ model width 2073mm, length 4946mm
          // Volkswagen Passat: width 1820mm, length 4780mm
          sizeScale: 0.0009,
          data: CAR_DATA,
          getPosition: d => d,
          getColor: d => [160, 160, 160],
          getYaw: d => heading,
          lightSettings: {},
          updateTriggers: {
            getYaw: heading
          }
        }),

      Object.keys(features).map(
        streamName =>
          new XvizLayer({
            id: `xviz-${streamName}`,
            ...coordinateProps,

            pickable: true,
            lightSettings: LIGHT_SETTINGS,

            data: features[streamName],
            style: styleParser.getStylesheet(streamName),
            objectStates: {},

            // Selection props (app defined, not used by deck.gl)
            streamName
          })
      )
    ];
  }

  _getTrackedViewState(viewState, carPosition) {
    return {
      ...viewState,
      longitude: carPosition.longitude,
      latitude: carPosition.latitude,
      bearing: viewState.bearing
    };
  }

  render() {
    const {vehiclePose, carPosition} = this.props;
    const {viewState} = this.state;

    if (!vehiclePose) {
      return null;
    }

    // track the vehicle
    const trackedViewState = this._getTrackedViewState(viewState, carPosition);

    return (
      <DeckGL
        width="100%"
        height="100%"
        views={new MapView({id: 'map'})}
        viewState={trackedViewState}
        controller={MapController}
        onViewportChange={this._onViewportChange}
        layers={this._getLayers()}
      >
        <StaticMap {...trackedViewState} viewId="map" mapStyle={MAP_STYLE} />
      </DeckGL>
    );
  }
}
