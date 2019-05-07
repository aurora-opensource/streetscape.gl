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
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import ObjectLabelsOverlay from './object-labels-overlay';

import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {XVIZStyleParser} from '@xviz/parser';

import XVIZLayer from '../../layers/xviz-layer';

import {VIEW_MODE, DEFAULT_VIEW_STATE} from '../../constants';
import {getViewStateOffset, getViews, getViewStates} from '../../utils/viewport';
import {resolveCoordinateTransform} from '../../utils/transform';
import {mergeXVIZStyles} from '../../utils/style';
import {normalizeStreamFilter} from '../../utils/stream-utils';
import stats from '../../utils/stats';

import {DEFAULT_ORIGIN, CAR_DATA, LIGHTS, DEFAULT_CAR} from './constants';

const noop = () => {};

function getStreamMetadata(metadata, streamName) {
  return (metadata && metadata.streams && metadata.streams[streamName]) || {};
}

const Z_INDEX = {
  point: 1,
  polygon: 2
};

export default class Core3DViewer extends PureComponent {
  static propTypes = {
    // Props from loader
    frame: PropTypes.object,
    metadata: PropTypes.object,

    // Rendering options
    showMap: PropTypes.bool,
    showTooltip: PropTypes.bool,
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

    // Callbacks
    onMapLoad: PropTypes.func,
    onDeckLoad: PropTypes.func,
    onHover: PropTypes.func,
    onClick: PropTypes.func,
    onContextMenu: PropTypes.func,
    onViewStateChange: PropTypes.func,

    // Debug info listener
    debug: PropTypes.func,

    // States
    viewState: PropTypes.object,
    viewOffset: PropTypes.object,
    objectStates: PropTypes.object
  };

  static defaultProps = {
    car: DEFAULT_CAR,
    viewMode: VIEW_MODE.PERSPECTIVE,
    xvizStyles: {},
    customLayers: [],
    onMapLoad: noop,
    onDeckLoad: noop,
    onViewStateChange: noop,
    onHover: noop,
    onClick: noop,
    onContextMenu: noop,
    showMap: true,
    showTooltip: false
  };

  constructor(props) {
    super(props);

    this.state = {
      styleParser: this._getStyleParser(props)
    };
  }

  deckRef = React.createRef();

  componentWillReceiveProps(nextProps) {
    if (this.props.viewMode !== nextProps.viewMode) {
      const viewState = {
        ...this.props.viewState,
        ...DEFAULT_VIEW_STATE,
        ...nextProps.viewMode.initialViewState
      };
      // Reset offset
      const viewOffset = {
        x: 0,
        y: 0,
        bearing: 0
      };

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
    if (this.props.frame !== nextProps.frame) {
      stats.get('frame-update').incrementCount();
    }
  }

  _onMapLoad = evt => {
    const map = evt.target;
    this.props.onMapLoad(map);
  };

  _onDeckLoad = () => {
    const deck = this.deckRef.current.deck;
    this.props.onDeckLoad(deck);
  };

  _onMetrics = deckMetrics => {
    if (this.props.debug) {
      const metrics = {
        fps: deckMetrics.frameRate.hz,
        redraw: deckMetrics['Redraw Count'].count
      };
      const table = stats.getTable();

      for (const key in table) {
        metrics[key] = table[key].count;
      }
      this.props.debug(metrics);
    }
    stats.reset();
  };

  _onViewStateChange = ({viewState, oldViewState}) => {
    const viewOffset = getViewStateOffset(oldViewState, viewState, this.props.viewOffset);
    this.props.onViewStateChange({viewState, viewOffset});
  };

  _onLayerHover = (info, evt) => {
    const objectId = info && info.object && info.object.id;
    this.isHovering = Boolean(objectId);
    this.props.onHover(info, evt);
  };

  _onLayerClick = (info, evt) => {
    const isRightClick = evt.which === 3;

    if (isRightClick) {
      this.props.onContextMenu(info, evt);
    } else {
      this.props.onClick(info, evt);
    }
  };

  _getStyleParser({metadata, xvizStyles}) {
    return new XVIZStyleParser(mergeXVIZStyles(metadata && metadata.styles, xvizStyles));
  }

  _getCarLayer() {
    const {frame, car} = this.props;
    const {
      origin = DEFAULT_ORIGIN,
      mesh,
      scale = [1, 1, 1],
      wireframe = false,
      texture = null,
      color = [0, 0, 0]
    } = car;

    return new SimpleMeshLayer({
      id: 'car',
      opacity: 1,
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: frame.origin || DEFAULT_ORIGIN,
      // Adjust for car center position relative to GPS/IMU
      getTransformMatrix: d =>
        frame.vehicleRelativeTransform
          .clone()
          .translate(origin)
          .scale(scale),
      mesh,
      data: CAR_DATA,
      getPosition: d => d,
      getColor: color,
      texture,
      wireframe,
      updateTriggers: {
        getTransformMatrix: frame.vehicleRelativeTransform
      }
    });
  }

  _getLayers() {
    const {
      frame,
      metadata,
      showTooltip,
      objectStates,
      customLayers,
      getTransformMatrix
    } = this.props;
    if (!frame || !metadata) {
      return [];
    }

    const {streams, lookAheads = {}} = frame;
    const {styleParser} = this.state;

    const streamFilter = normalizeStreamFilter(this.props.streamFilter);
    const featuresAndFutures = new Set(
      Object.keys(streams)
        .concat(Object.keys(lookAheads))
        .filter(streamFilter)
    );

    return [
      this._getCarLayer(),
      Array.from(featuresAndFutures)
        .map(streamName => {
          // Check lookAheads first because it will contain the selected futures
          // while streams would contain the full futures array
          const stream = lookAheads[streamName] || streams[streamName];
          const streamMetadata = getStreamMetadata(metadata, streamName);
          const coordinateProps = resolveCoordinateTransform(
            frame,
            streamMetadata,
            getTransformMatrix
          );

          const stylesheet = styleParser.getStylesheet(streamName);

          // Support both features and lookAheads, respectively
          const primitives = stream.features || stream;
          if (primitives && primitives.length) {
            return new XVIZLayer({
              id: `xviz-${streamName}`,
              ...coordinateProps,

              pickable: showTooltip || primitives[0].id,

              data: primitives,
              style: stylesheet,
              objectStates,
              vehicleRelativeTransform: frame.vehicleRelativeTransform,

              // Hack: draw extruded polygons last to defeat depth test when rendering translucent objects
              // This is not used by deck.gl, only used in this function to sort the layers
              zIndex: Z_INDEX[primitives[0].type] || 0,

              // Selection props (app defined, not used by deck.gl)
              streamName
            });
          }
          return null;
        })
        .filter(Boolean)
        .sort((layer1, layer2) => layer1.props.zIndex - layer2.props.zIndex),
      customLayers.map(layer => {
        // Clone layer props
        const {props} = layer;
        const additionalProps = {};

        if (props.streamName) {
          // Use log data
          const stream = streams[props.streamName];
          const streamMetadata = getStreamMetadata(metadata, props.streamName);
          Object.assign(
            additionalProps,
            resolveCoordinateTransform(frame, streamMetadata, getTransformMatrix),
            {
              data: stream && stream.features
            }
          );
        } else if (props.coordinate) {
          // Apply log-specific coordinate props
          Object.assign(
            additionalProps,
            resolveCoordinateTransform(frame, props, getTransformMatrix)
          );
        } else {
          return layer;
        }

        return layer.clone(additionalProps);
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
    const {viewMode, frame, viewState, viewOffset} = this.props;

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
      frame,
      metadata,
      objectStates,
      renderObjectLabel,
      getTransformMatrix,
      style,
      mapStyle,
      viewMode,
      showMap
    } = this.props;
    const {styleParser} = this.state;

    return (
      <DeckGL
        width="100%"
        height="100%"
        ref={this.deckRef}
        effects={[LIGHTS]}
        views={getViews(viewMode)}
        viewState={this._getViewState()}
        layers={this._getLayers()}
        layerFilter={this._layerFilter}
        getCursor={this._getCursor}
        onLoad={this._onDeckLoad}
        onHover={this._onLayerHover}
        onClick={this._onLayerClick}
        onViewStateChange={this._onViewStateChange}
        _onMetrics={this._onMetrics}
      >
        {showMap && (
          <StaticMap
            reuseMap={true}
            attributionControl={false}
            mapboxApiAccessToken={mapboxApiAccessToken}
            mapStyle={mapStyle}
            visible={frame && frame.origin && !viewMode.firstPerson}
            onLoad={this._onMapLoad}
          />
        )}

        <ObjectLabelsOverlay
          objectSelection={objectStates.selected}
          frame={frame}
          metadata={metadata}
          renderObjectLabel={renderObjectLabel}
          xvizStyleParser={styleParser}
          style={style}
          getTransformMatrix={getTransformMatrix}
        />

        {this.props.children}
      </DeckGL>
    );
  }
}
