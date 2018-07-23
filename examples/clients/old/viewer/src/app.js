/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {
  COORDINATE_SYSTEM,
  PointCloudLayer,
  PolygonLayer,
  MapView,
  MapController
} from 'deck.gl';
import MeshLayer from '@deck.gl/experimental-layers/dist/mesh-layer/mesh-layer';

import {DATA_TYPE, DATA_CONFIG, MAP_STYLE, OBJECT_COLORS} from './constants';
import Synchronizer from './utils/synchronizer';
import {loadOBJMesh} from './utils/data-loader';

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 18,
  pitch: 20,
  bearing: 0
};

const CAR_DATA = [[0, 0, 0]];

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false,
      timestamp: null,
      timeRange: null,
      frame: null,
      carMesh: null,
      viewState: INITIAL_VIEW_STATE
    };

    this._togglePlay = this._togglePlay.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
    this._onTimeSliderChange = this._onTimeSliderChange.bind(this);

    loadOBJMesh('./assets/car.obj').then(carMesh => this.setState({carMesh}));

    this._synchronizer = new Synchronizer(DATA_CONFIG)
      .on('metadata', ({synchronizer}) => {
        const timeRange = synchronizer.getTimeRange();
        this.setState({timeRange});
        synchronizer.getFrame(timeRange.start);
      })
      .on('frame', ({timestamp, frame}) => {
        this.setState({timestamp, frame});

        if (this.state.isPlaying) {
          this._nextFrame();
        }
      });
  }

  _togglePlay() {
    const isPlaying = !this.state.isPlaying;
    this.setState({isPlaying});

    if (isPlaying) {
      this._nextFrame();
    }
  }

  _nextFrame() {
    const {timestamp, timeRange} = this.state;
    let newTimestamp = timestamp + 100;
    if (newTimestamp > timeRange.end) {
      newTimestamp = timeRange.start;
    }
    this._synchronizer.getFrame(newTimestamp);
  }

  _onTimeSliderChange(evt) {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
    }
    this._synchronizer.getFrame(+evt.target.value);
  }

  _onViewportChange(viewState) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  _getLayers() {
    const {frame, carMesh} = this.state;
    const {vehiclePose} = frame;

    if (!vehiclePose) {
      return null;
    }

    const coordinateProps = {
      coordinateOrigin: [vehiclePose.longitude, vehiclePose.latitude],
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
    };

    return Object.values(frame).map(({type, data, name}) => {
      switch (type) {
        case DATA_TYPE.POINT_CLOUD:
          return new PointCloudLayer({
            id: `point-cloud-${name}`,
            ...coordinateProps,
            // Adjust for Velodyne scanner position relative to GPS/IMU
            // http://www.cvlibs.net/datasets/kitti/setup.php
            modelMatrix: vehiclePose.pose.getTransformationMatrix().translate([0.81, -0.32, 1.73]),
            numInstances: data.size,
            instancePositions: data.positions,
            instanceNormals: data.normals,
            instanceColors: data.colors,
            radiusPixels: 2,
            lightSettings: {}
          });

        case DATA_TYPE.VEHICLE_POSE:
          return (
            carMesh &&
            new MeshLayer({
              id: 'car',
              ...coordinateProps,
              // Adjust for car center position relative to GPS/IMU
              // http://www.cvlibs.net/datasets/kitti/setup.php
              modelMatrix: vehiclePose.pose.getTransformationMatrix().translate([1.08, -0.32, 0]),
              mesh: carMesh,
              // OBJ model width 2073mm, length 4946mm
              // Volkswagen Passat: width 1820mm, length 4780mm
              sizeScale: 0.0009,
              data: CAR_DATA,
              getPosition: d => d,
              getColor: d => [160, 160, 160],
              getYaw: d => (vehiclePose.yaw / Math.PI) * 180,
              lightSettings: {},
              updateTriggers: {
                getYaw: vehiclePose
              }
            })
          );

        case DATA_TYPE.TRACKING:
          return new PolygonLayer({
            id: 'tracklets',
            data,
            opacity: 0.4,
            ...coordinateProps,
            extruded: true,
            wireframe: true,
            modelMatrix: vehiclePose.pose.getTransformationMatrix().translate([0.81, -0.32, 0]),
            getPolygon: d => d.polygon,
            getElevation: d => d.height,
            getFillColor: d => OBJECT_COLORS[d.objectType] || OBJECT_COLORS.Unknown,
            lightSettings: {}
          });

        default:
          return null;
      }
    });
  }

  _renderVideos() {
    return Object.values(this.state.frame).map(({type, data, name}) => {
      switch (type) {
        case DATA_TYPE.IMAGE:
          return (
            <div key={name}>
              <label>{name}</label>
              <img src={data} />
            </div>
          );

        default:
          return null;
      }
    });
  }

  _getTrackedViewState(viewState, vehiclePose) {
    if (!vehiclePose) {
      return viewState;
    }
    return {
      ...viewState,
      longitude: vehiclePose.longitude,
      latitude: vehiclePose.latitude,
      bearing: viewState.bearing
    };
  }

  render() {
    const {isPlaying, viewState, frame, timestamp, timeRange} = this.state;

    if (!frame) {
      return null;
    }

    // track the vehicle
    const trackedViewState = this._getTrackedViewState(viewState, frame.vehiclePose);

    return (
      <div id="container">
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

        <div id="videos">{this._renderVideos()}</div>

        <div id="timeline">
          <input
            type="range"
            value={timestamp}
            onChange={this._onTimeSliderChange}
            min={timeRange.start}
            max={timeRange.end}
          />
          <div>
            <span className="play-btn" onClick={this._togglePlay}>
              {isPlaying ? '❙❙' : '▶'}
            </span>
            <span>{new Date(timestamp).toUTCString()}</span>
          </div>
        </div>
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
