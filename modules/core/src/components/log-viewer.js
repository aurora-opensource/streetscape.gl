import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {StaticMap} from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, WebMercatorViewport} from 'deck.gl';
import {CubeGeometry} from 'luma.gl';

import {MeshLayer} from '@deck.gl/experimental-layers';
import {XvizStyleParser} from '@xviz/client';

import {loadOBJMesh} from '../loaders/obj-loader';
import XvizLayer from '../layers/xviz-layer';

import {VIEW_MODES, COORDINATES} from '../constants';
import {getViewStateOffset, getViews, getViewStates} from '../utils/viewport';
import {getPoseFromJson} from '../utils/pose';
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

  componentDidMount() {
    this._updateTransforms(this.props.frame);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.viewMode !== nextProps.viewMode) {
      this.setState({
        viewState: {...this.state.viewState, ...nextProps.viewMode.initialProps}
      });
    }
    if (this.props.frame !== nextProps.frame) {
      this._updateTransforms(nextProps.frame);
    }
  }

  _updateTransforms(frame) {
    if (!frame) {
      return;
    }
    const {mapOrigin} = frame;

    // Pose instance is flattened when passed back from worker
    // TODO - Fix this in XVIZ
    const mapPose = getPoseFromJson(frame.mapPose || {});
    const vehiclePose = getPoseFromJson(frame.vehiclePose || {});

    // equivalent to IDENTITY_POSE.getTransformationMatrixFromPose(mapPose);
    const mapRelativeTransform = mapPose.getTransformationMatrix();
    const vehicleRelativeTransform = mapRelativeTransform.clone().multiplyRight(vehiclePose.getTransformationMatrix());
    const headingVector = vehicleRelativeTransform.transformVector([0, 1, 0]);

    const viewport = new WebMercatorViewport({
      longitude: mapOrigin[0],
      latitude: mapOrigin[1]
    });
    const carPosition = viewport.addMetersToLngLat(
      mapOrigin,
      vehicleRelativeTransform.transformVector([0, 0, 0])
    );

    this.setState({
      mapRelativeTransform,
      vehicleRelativeTransform,
      heading: (Math.atan2(headingVector[1], headingVector[0]) / Math.PI) * 180 - 90,
      carPosition
    });
  }

  _onViewStateChange = ({viewState, oldViewState}) => {
    this.setState({
      viewState,
      viewOffset: getViewStateOffset(oldViewState, viewState, this.state.viewOffset)
    });
  };

  _getLayers() {
    const {frame, car, viewMode, metadata} = this.props;
    if (!frame || !metadata) {
      return [];
    }

    const {streams, mapOrigin, transformMatrix} = frame;
    const {
      styleParser,
      carMesh,
      heading,
      mapRelativeTransform,
      vehicleRelativeTransform
    } = this.state;

    // TODO
    return [
      carMesh &&
        new MeshLayer({
          id: 'car',
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: mapOrigin,
          // Adjust for car center position relative to GPS/IMU
          modelMatrix: vehicleRelativeTransform.clone().translate(car.origin || DEFAULT_CAR.origin),
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
      Object.keys(streams).map(streamName => {
        const stream = streams[streamName];
        const {coordinate} = metadata.streams[streamName] || {};
        const coordinateProps = {
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: mapOrigin
        };
        switch (coordinate) {
          case COORDINATES.GEOGRAPHIC:
            coordinateProps.coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
            break;
          case COORDINATES.MAP_RELATIVE:
            coordinateProps.modelMatrix = mapRelativeTransform;
            break;
          case COORDINATES.CUSTOM:
            coordinateProps.modelMatrix = transformMatrix;
            break;
          default:
            coordinateProps.modelMatrix = vehicleRelativeTransform;
        }

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
    const {viewMode} = this.props;
    const {viewState, viewOffset, heading, carPosition} = this.state;

    const trackedPosition = carPosition
      ? {
          longitude: carPosition[0],
          latitude: carPosition[1],
          bearing: heading
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
