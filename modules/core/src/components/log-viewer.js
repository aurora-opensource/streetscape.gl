// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {StaticMap} from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer} from 'deck.gl';
import {CubeGeometry} from 'luma.gl';

import {MeshLayer} from '@deck.gl/experimental-layers';
import {XvizStyleParser} from '@xviz/parser';

import {loadOBJMesh} from '../loaders/obj-loader';
import XvizLayer from '../layers/xviz-layer';

import {VIEW_MODES} from '../constants';
import {getViewStateOffset, getViews, getViewStates} from '../utils/viewport';
import {resolveCoordinateTransform} from '../utils/transform';
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
    metadata: PropTypes.object,
    mapboxApiAccessToken: PropTypes.string,
    mapStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    car: PropTypes.object,
    viewMode: PropTypes.object
  };

  static defaultProps = {
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
      styleParser: props.metadata && new XvizStyleParser(props.metadata.styles),
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
    if (this.props.metadata !== nextProps.metadata) {
      this.setState({
        styleParser: new XvizStyleParser(nextProps.metadata.styles)
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
          getYaw: d => heading,
          lightSettings: {},
          updateTriggers: {
            getYaw: heading
          }
        }),
      Object.keys(streams).map(streamName => {
        const stream = streams[streamName];
        const streamMetadata = metadata.streams[streamName];
        const coordinateProps = resolveCoordinateTransform(frame, streamMetadata);

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
    const {mapboxApiAccessToken, mapStyle, viewMode} = this.props;

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
        <StaticMap
          mapboxApiAccessToken={mapboxApiAccessToken}
          mapStyle={mapStyle}
          visible={!viewMode.firstPerson}
        />
      </DeckGL>
    );
  }
}

const getLogState = log => ({
  frame: log.getCurrentFrame(),
  metadata: log.getMetadata()
});

export default connectToLog({getLogState, Component: Core3DViewer});
