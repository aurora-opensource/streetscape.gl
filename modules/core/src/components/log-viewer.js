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

import {VIEW_MODE} from '../constants';
import {getViewStateOffset, getViews, getViewStates} from '../utils/viewport';
import {resolveCoordinateTransform} from '../utils/transform';
import {mergeXvizStyles} from '../utils/style';
import {normalizeStreamFilter} from '../utils/stream-utils';
import {setObjectState} from '../utils/object-state';

import ObjectLabelsOverlay from './object-labels-overlay';

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
    // Props from loader
    frame: PropTypes.object,
    metadata: PropTypes.object,

    // Rendering options
    mapboxApiAccessToken: PropTypes.string,
    mapStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    xvizStyles: PropTypes.object,
    car: PropTypes.object,
    viewMode: PropTypes.object,
    streamFilter: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
      PropTypes.object,
      PropTypes.func
    ]),
    customLayers: PropTypes.array,
    renderObjectLabel: PropTypes.func,
    getTransformMatrix: PropTypes.func,

    // Optional: to use with external state management (e.g. Redux)
    viewState: PropTypes.object,
    viewOffset: PropTypes.object,
    objectStates: PropTypes.object,
    onViewStateChange: PropTypes.func,
    onObjectStateChange: PropTypes.func
  };

  static defaultProps = {
    car: DEFAULT_CAR,
    viewMode: VIEW_MODE.PERSPECTIVE,
    xvizStyles: {},
    customLayers: [],
    onViewStateChange: () => {},
    onObjectStateChange: () => {},
    getTransformMatrix: (streamName, context) => null
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
      objectStates: {},
      styleParser: this._getStyleParser(props),
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
      const viewState = {...this.state.viewState, ...nextProps.viewMode.initialProps};
      let viewOffset = this.state.viewOffset;
      if (nextProps.viewMode.firstPerson) {
        // Reset offset if switching to first person mode
        viewOffset = {
          x: 0,
          y: 0,
          bearing: 0
        };
      }

      this.setState({viewState, viewOffset});
      nextProps.onViewStateChange({viewState, viewOffset});
    }
    if (
      this.props.metadata !== nextProps.metadata ||
      this.props.xvizStyles !== nextProps.xvizStyles
    ) {
      this.setState({
        styleParser: this._getStyleParser(nextProps)
      });
    }
  }

  _onViewStateChange = ({viewState, oldViewState}) => {
    const viewOffset = getViewStateOffset(
      oldViewState,
      viewState,
      this.props.viewOffset || this.state.viewOffset
    );
    this.setState({viewState, viewOffset});
    this.props.onViewStateChange({viewState, viewOffset});
  };

  _onLayerHover = info => {
    const objectId = info && info.object && info.object.id;
    this.isHovering = Boolean(objectId);

    // TODO: show hover info

    // const showHoverInfo = info && this.props.settings.showInfo;
    // this.setState({
    //   hoverInfo: showHoverInfo ? info : null
    // });
  };

  _onLayerClick = (info, infos, evt) => {
    const objectId = info && info.object && info.object.id;

    if (objectId) {
      const isRightClick = evt.which === 3;

      if (isRightClick) {
        // TODO: context menu
      } else {
        // Select object
        let {objectStates} = this.state;
        const isObjectSelected = objectStates.selected && objectStates.selected[objectId];

        objectStates = setObjectState(objectStates, {
          stateName: 'selected',
          id: objectId,
          value: !isObjectSelected
        });

        this.setState({objectStates});
        this.props.onObjectStateChange(objectStates);
      }
    }
  };

  _getStyleParser({metadata, xvizStyles}) {
    return new XvizStyleParser(mergeXvizStyles(metadata && metadata.styles, xvizStyles));
  }

  _getLayers() {
    const {
      frame,
      car,
      viewMode,
      metadata,
      customLayers,
      streamSettings,
      getTransformMatrix
    } = this.props;
    if (!frame || !metadata) {
      return [];
    }

    const {streams, origin, heading, vehicleRelativeTransform} = frame;
    const {styleParser, carMesh} = this.state;

    const objectStates = this.props.objectStates || this.state.objectStates;
    const streamFilter = normalizeStreamFilter(this.props.streamFilter);

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
      Object.keys(streams)
        .filter(streamName => streamFilter(streamName) && streamSettings[streamName])
        .map(streamName => {
          const stream = streams[streamName];
          const streamMetadata = metadata.streams[streamName];
          const coordinateProps = resolveCoordinateTransform(
            frame,
            streamMetadata,
            getTransformMatrix
          );

          if (stream.features && stream.features.length) {
            return new XvizLayer({
              id: `xviz-${streamName}`,
              ...coordinateProps,

              pickable: true,
              lightSettings: LIGHT_SETTINGS,

              data: stream.features,
              style: styleParser.getStylesheet(streamName),
              objectStates,

              // Hack: draw extruded polygons last to defeat depth test when rendering translucent objects
              // This is not used by deck.gl, only used in this function to sort the layers
              zIndex: streamMetadata.type === 'polygon' ? 2 : 0,

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
              lightSettings: {},

              // Hack: draw point clouds before polygons to defeat depth test when rendering translucent objects
              // This is not used by deck.gl, only used in this function to sort the layers
              zIndex: 1
            });
          }
          return null;
        })
        .filter(Boolean)
        .sort((layer1, layer2) => layer1.props.zIndex - layer2.props.zIndex),

      customLayers.map(layer => {
        // Clone layer props
        const props = {...layer.props};

        if (props.streamName) {
          // Use log data
          const stream = streams[props.streamName];
          const streamMetadata = metadata.streams[props.streamName];
          Object.assign(
            props,
            resolveCoordinateTransform(frame, streamMetadata, getTransformMatrix),
            {
              data: stream && stream.features
            }
          );
        } else if (props.coordinate) {
          // Apply log-specific coordinate props
          Object.assign(props, resolveCoordinateTransform(frame, props, getTransformMatrix));
        }

        return layer.clone(props);
      })
    ];
  }

  _layerFilter({layer, viewport, isPicking}) {
    if (viewport.id === 'driver') {
      return layer.id !== 'car';
    }
    return true;
  }

  _getCursor = () => {
    return this.isHovering ? 'pointer' : 'crosshair';
  };

  _getViewState() {
    const {viewMode, frame} = this.props;
    // Allow users to override viewState from application
    // if not specified then use the saved internal state
    const viewState = this.props.viewState || this.state.viewState;
    const viewOffset = this.props.viewOffset || this.state.viewOffset;

    const trackedPosition = frame
      ? {
          longitude: frame.trackPosition[0],
          latitude: frame.trackPosition[1],
          bearing: 90 - frame.heading
        }
      : null;

    return getViewStates({viewState, viewMode, trackedPosition, offset: viewOffset});
  }

  render() {
    const {
      mapboxApiAccessToken,
      mapStyle,
      viewMode,
      frame,
      metadata,
      renderObjectLabel,
      objectLabelColor,
      getTransformMatrix
    } = this.props;
    const objectSelection = (this.props.objectStates || this.state.objectStates).selected;

    return (
      <DeckGL
        width="100%"
        height="100%"
        views={getViews(viewMode)}
        viewState={this._getViewState()}
        layers={this._getLayers()}
        layerFilter={this._layerFilter}
        getCursor={this._getCursor}
        onLayerHover={this._onLayerHover}
        onLayerClick={this._onLayerClick}
        onViewStateChange={this._onViewStateChange}
      >
        <StaticMap
          reuseMap={true}
          mapboxApiAccessToken={mapboxApiAccessToken}
          mapStyle={mapStyle}
          visible={!viewMode.firstPerson}
        />

        <ObjectLabelsOverlay
          objectSelection={objectSelection}
          frame={frame}
          metadata={metadata}
          renderObjectLabel={renderObjectLabel}
          objectLabelColor={objectLabelColor}
          getTransformMatrix={getTransformMatrix}
        />
      </DeckGL>
    );
  }
}

const getLogState = log => ({
  frame: log.getCurrentFrame(),
  metadata: log.getMetadata(),
  streamSettings: log.getStreamSettings()
});

export default connectToLog({getLogState, Component: Core3DViewer});
