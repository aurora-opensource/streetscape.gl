import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {StaticMap} from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer} from 'deck.gl';
import {CubeGeometry} from 'luma.gl';
import {Matrix4} from 'math.gl';

import {MeshLayer} from '@deck.gl/experimental-layers';
import {XvizStyleParser} from '@xviz/client';

import {loadOBJMesh} from '../loaders/obj-loader';
import XvizLayer from '../layers/xviz-layer';

import VIEW_MODES from '../constants/view-modes';
import {getViewStateOffset, getViews, getViewStates} from '../utils/viewport';
import connectToLog from './connect';

const CAR_DATA = [[0, 0, 0]];
const LIGHT_SETTINGS = {
  lightsPosition: [0, 0, 5000, -100, 40, 1000],
  ambientRatio: 0.5,
  diffuseRatio: 0.2,
  specularRatio: 0.4,
  lightsStrength: [1.0, 0.0, 1.0, 0.0],
  numberOfLights: 2
};
const DEFAULT_CAR = {
  mesh: new CubeGeometry(),
  texture: null,
  scale: 1,
  origin: [0, 0, 0]
};

class Core3DViewer extends PureComponent {
  static propTypes = {
    frame: PropTypes.object,
    xvizStyle: PropTypes.object,
    mapStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    car: PropTypes.object,
    viewMode: PropTypes.object
  };

  static defaultProps = {
    xvizStyle: {},
    car: DEFAULT_CAR,
    viewMode: VIEW_MODES.PERSPECTIVE
  };

  constructor(props) {
    super(props);

    this.state = {
      viewState: {
        width: 1,
        height: 1,
        longitude: 0,
        latitude: 0,
        zoom: 18,
        pitch: 20,
        bearing: 0,
        ...props.viewMode.initialProps
      },
      viewOffset: {
        x: 0,
        y: 0,
        bearing: 0
      },
      styleParser: new XvizStyleParser(props.xvizStyle),
      carMesh: null
    };

    if (typeof props.car.mesh === 'string') {
      loadOBJMesh(props.car.mesh).then(carMesh => this.setState({carMesh}));
    } else {
      this.state.carMesh = props.car.mesh || DEFAULT_CAR.mesh;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.viewMode !== nextProps.viewMode) {
      this.setState({
        viewState: {...this.state.viewState, ...nextProps.viewMode.initialProps}
      });
    }
  }

  _onViewStateChange = ({viewState, oldViewState}) => {
    this.setState({
      viewState,
      viewOffset: getViewStateOffset(oldViewState, viewState, this.state.viewOffset)
    });
  };

  _getLayers() {
    const {frame, car, viewMode} = this.props;
    if (!frame) {
      return [];
    }

    const {features, heading, carPosition, pointCloud} = frame;
    const {styleParser, carMesh} = this.state;
    const transformMatrix = new Matrix4(this.props.frame.transformMatrix);

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
          modelMatrix: transformMatrix.clone().translate(car.origin || DEFAULT_CAR.origin),
          mesh: carMesh,
          texture: car.texture || DEFAULT_CAR.texture,
          sizeScale: car.scale || DEFAULT_CAR.scale,
          data: CAR_DATA,
          getPosition: d => d,
          getColor: d => [160, 160, 160],
          getYaw: d => heading,
          lightSettings: {},
          updateTriggers: {
            getYaw: heading
          }
        }),
      pointCloud &&
        new PointCloudLayer({
          id: `xviz-pointcloud`,
          ...coordinateProps,
          numInstances: pointCloud.numInstances,
          instancePositions: pointCloud.positions,
          instanceNormals: pointCloud.normals,
          instanceColors: pointCloud.colors,
          instancePickingColors: pointCloud.colors,
          radiusPixels: viewMode.firstPerson ? 4 : 1,
          lightSettings: {}
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

  _layerFilter({layer, viewport, isPicking}) {
    if (viewport.id === 'driver') {
      return layer.id !== 'car';
    }
    return true;
  }

  _getViewState() {
    const {frame, viewMode} = this.props;
    const {viewState, viewOffset} = this.state;

    const trackedPosition = frame
      ? {
          longitude: frame.carPosition.longitude,
          latitude: frame.carPosition.latitude,
          bearing: frame.heading
        }
      : null;

    return getViewStates({viewState, viewMode, trackedPosition, offset: viewOffset});
  }

  render() {
    const {mapStyle, viewMode} = this.props;

    return (
      <DeckGL
        width="100%"
        height="100%"
        views={getViews(viewMode)}
        viewState={this._getViewState()}
        layers={this._getLayers()}
        layerFilter={this._layerFilter}
        onViewStateChange={this._onViewStateChange}
      >
        <StaticMap mapStyle={mapStyle} visible={!viewMode.firstPerson} />
      </DeckGL>
    );
  }
}

const getLogState = log => ({
  frame: log.getCurrentFrame()
});

export default connectToLog({getLogState, Component: Core3DViewer});
