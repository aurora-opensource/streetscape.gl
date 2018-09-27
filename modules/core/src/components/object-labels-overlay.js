// @flow
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {getXvizConfig} from '@xviz/parser';

import PerspectivePopup from './perspective-popup';

import {getCentroid} from '../utils/geometry';
import {resolveCoordinateTransform, positionToLngLat} from '../utils/transform';

const renderDefaultObjectLabel = ({id}) => <div>ID: {id}</div>;

export default class ObjectLabelsOverlay extends Component {
  static propTypes = {
    viewport: PropTypes.object,
    objectSelection: PropTypes.object,
    frame: PropTypes.object,
    metadata: PropTypes.object,

    renderObjectLabel: PropTypes.func
  };

  static defaultProps = {
    objectSelection: {},
    renderObjectLabel: renderDefaultObjectLabel
  };

  static childContextTypes = {
    viewport: PropTypes.object
  };

  state = {};

  getChildContext() {
    return {
      viewport: this.props.viewport
    };
  }

  componentWillReceiveProps(nextProps) {
    const {frame, metadata} = nextProps;

    if (frame && frame !== this.props.frame) {
      const objectStreamName = this._findObjectGeometryStream(frame.streams);
      this.setState({objectStreamName});

      if (objectStreamName) {
        const streamMetadata = metadata.streams[objectStreamName];
        const coordinateProps = resolveCoordinateTransform(frame, streamMetadata);
        this.setState({coordinateProps});
      }
    }
  }

  _findObjectGeometryStream(streams) {
    // TODO - deal with multiple streams
    const {OBJECT_STREAM} = getXvizConfig();
    return streams[OBJECT_STREAM] ? OBJECT_STREAM : null;
  }

  _getTrackingPoint(object) {
    const point = object.center || getCentroid(object.vertices);
    return positionToLngLat(point, this.props.viewport, this.state.coordinateProps);
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
        dynamicPosition={true}
        tipSize={30}
        closeButton={false}
        closeOnClick={false}
      >
        <ObjectLabel id={object.id} frame={frame} metadata={metadata} />
      </PerspectivePopup>
    );
  };

  render() {
    const {frame} = this.props;
    const {objectStreamName} = this.state;

    if (!frame || !objectStreamName) {
      return null;
    }

    const objects = frame.streams[objectStreamName].features;

    return <div>{objects.map(this._renderPerspectivePopup)}</div>;
  }
}
