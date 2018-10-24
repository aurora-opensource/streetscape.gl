// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {getXvizConfig} from '@xviz/parser';
import {experimental} from 'react-map-gl';
const {MapContext} = experimental;

import PerspectivePopup from './perspective-popup';

import {getCentroid} from '../utils/geometry';
import {resolveCoordinateTransform, positionToLngLat} from '../utils/transform';

const renderDefaultObjectLabel = ({id}) => <div>ID: {id}</div>;

export default class ObjectLabelsOverlay extends Component {
  static propTypes = {
    objectSelection: PropTypes.object,
    frame: PropTypes.object,
    metadata: PropTypes.object,

    renderObjectLabel: PropTypes.func,
    getTransformMatrix: PropTypes.func
  };

  static defaultProps = {
    objectSelection: {},
    renderObjectLabel: renderDefaultObjectLabel
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this._getCoordinateProps(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    const {frame} = nextProps;

    if (frame && frame !== this.props.frame) {
      this.setState(this._getCoordinateProps(nextProps));
    }
  }

  _getCoordinateProps(props) {
    const {frame, metadata, getTransformMatrix} = props;

    if (frame) {
      const objectStreamName = this._findObjectGeometryStream(frame.streams);
      const result = {objectStreamName};

      if (objectStreamName) {
        const streamMetadata = metadata.streams[objectStreamName];
        result.coordinateProps = resolveCoordinateTransform(
          frame,
          streamMetadata,
          getTransformMatrix
        );
      }
      return result;
    }
    return null;
  }

  _findObjectGeometryStream(streams) {
    // TODO - deal with multiple streams
    const {OBJECT_STREAM} = getXvizConfig();
    return streams[OBJECT_STREAM] ? OBJECT_STREAM : null;
  }

  _getTrackingPoint(object) {
    const point = object.center || getCentroid(object.vertices);
    return positionToLngLat(point, this.state.coordinateProps);
  }

  _renderPerspectivePopup = object => {
    const {objectSelection, frame, metadata, renderObjectLabel: ObjectLabel} = this.props;

    if (!objectSelection[object.id]) {
      return null;
    }

    const trackingPoint = this._getTrackingPoint(object);
    // compensate for camera offset
    trackingPoint[2] -= frame.origin[2];

    return (
      <PerspectivePopup
        key={object.id}
        longitude={trackingPoint[0]}
        latitude={trackingPoint[1]}
        altitude={trackingPoint[2]}
        anchor="bottom-left"
        dynamicPosition={false}
        tipSize={30}
        sortByDepth={true}
        closeButton={false}
        closeOnClick={false}
      >
        <ObjectLabel id={object.id} frame={frame} metadata={metadata} />
      </PerspectivePopup>
    );
  };

  render() {
    const {frame, viewport, renderObjectLabel} = this.props;
    const {objectStreamName} = this.state;

    if (!frame || !objectStreamName || !renderObjectLabel) {
      return null;
    }

    const objects = frame.streams[objectStreamName].features;

    return (
      <MapContext.Provider value={{viewport}}>
        {objects.map(this._renderPerspectivePopup)}
      </MapContext.Provider>
    );
  }
}
