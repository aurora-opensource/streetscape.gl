import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {StaticMap} from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer} from 'deck.gl';
import {CubeGeometry} from 'luma.gl';
import {_Pose as Pose, Matrix4} from 'math.gl';

import {MeshLayer} from '@deck.gl/experimental-layers';
import {XvizStyleParser} from '@xviz/parser';

import {loadOBJMesh} from '../loaders/obj-loader';
import XvizLayer from '../layers/xviz-layer';

import {VIEW_MODES, COORDINATES} from '../constants';
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

  _getCoordinateTransform(streamName) {
    const {frame, metadata} = this.props;

    const {origin, transforms = {}, vehicleRelativeTransform} = frame;

    const {coordinate, pose} = metadata.streams[streamName] || {};

    let coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS;
    let modelMatrix = vehicleRelativeTransform;

    switch (coordinate) {
      case COORDINATES.GEOGRAPHIC:
        coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
        break;

      case COORDINATES.VEHICLE_RELATIVE:
        modelMatrix = vehicleRelativeTransform;
        break;

      default:
        if (coordinate) {
          modelMatrix = transforms[coordinate];
        }
    }

    if (pose) {
      modelMatrix = new Matrix4(modelMatrix).multiplyRight(
        new Pose(pose).getTransformationMatrix()
      );
    }

    return {
      coordinateSystem,
      coordinateOrigin: origin,
      modelMatrix
    };
  }

  _getLayers() {
    const {frame, car, viewMode, metadata} = this.props;
    if (!frame || !metadata) {
      return [];
    }

    const {streams, origin, heading, vehicleRelativeTransform} = frame;
    const {styleParser, carMesh} = this.state;

    // TODO
    return [
      carMesh &&
        new MeshLayer({
          id: 'car',
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: origin,
          // Adjust for car center position relative to GPS/IMU
          modelMatrix: vehicleRelativeTransform.clone().translate(car.origin || DEFAULT_CAR.origin),
          mesh: carMesh,
          texture: car.texture || DEFAULT_CAR.texture,
          sizeScale: car.scale || DEFAULT_CAR.scale,
          data: CAR_DATA,
          getPosition: d => d,
          getColor: d => [160, 160, 160],
          getYaw: d => -heading,
          lightSettings: {},
          updateTriggers: {
            getYaw: heading
          }
        }),
      Object.keys(streams).map(streamName => {
        const stream = streams[streamName];
        const coordinateProps = this._getCoordinateTransform(streamName);

        if (stream.features && stream.features.length) {
          return new XvizLayer({
            id: `xviz-${streamName}`,
            ...coordinateProps,

            pickable: true,
            lightSettings: LIGHT_SETTINGS,

            data: stream.features,
            style: styleParser.getStylesheet(streamName),
            objectStates: {},

            // Selection props (app defined, not used by deck.gl)
            streamName
          });
        }
        if (stream.pointCloud) {
          return new PointCloudLayer({
            id: `xviz-${streamName}`,
            ...coordinateProps,
            numInstances: stream.pointCloud.numInstances,
            instancePositions: stream.pointCloud.positions,
            instanceNormals: stream.pointCloud.normals,
            instanceColors: stream.pointCloud.colors,
            instancePickingColors: stream.pointCloud.colors,
            radiusPixels: viewMode.firstPerson ? 4 : 1,
            lightSettings: {}
          });
        }
        return null;
      })
    ];
  }

  _layerFilter({layer, viewport, isPicking}) {
    if (viewport.id === 'driver') {
      return layer.id !== 'car';
    }
    return true;
  }

  _getViewState() {
    const {viewMode, frame} = this.props;
    const {viewState, viewOffset} = this.state;

    const trackedPosition = frame
      ? {
          longitude: frame.trackPosition[0],
          latitude: frame.trackPosition[1],
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
  frame: log.getCurrentFrame(),
  metadata: log.metadata
});

export default connectToLog({getLogState, Component: Core3DViewer});
