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
    objectLabelColor: PropTypes.string,
    getTransformMatrix: PropTypes.func
  };

  static defaultProps = {
    objectSelection: {},
    renderObjectLabel: renderDefaultObjectLabel,
    objectLabelColor: '#fff'
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
    const lngLatZ = positionToLngLat(point, this.state.coordinateProps);
    lngLatZ[2] += object.height || 1.5;
    return lngLatZ;
  }

  _renderPerspectivePopup = object => {
    const {
      objectSelection,
      frame,
      metadata,
      renderObjectLabel: ObjectLabel,
      objectLabelColor
    } = this.props;

    if (!objectSelection[object.id]) {
      return null;
    }

    const trackingPoint = this._getTrackingPoint(object);
    // compensate for camera offset
    trackingPoint[2] -= frame.origin[2];

    return (
      <PerspectivePopup
        key={object.id}
        className="object-label"
        longitude={trackingPoint[0]}
        latitude={trackingPoint[1]}
        altitude={trackingPoint[2]}
        anchor="bottom-left"
        dynamicPosition={true}
        tipSize={30}
        color={objectLabelColor}
        sortByDepth={true}
        closeButton={false}
        closeOnClick={false}
      >
        <ObjectLabel id={object.id} object={object} frame={frame} metadata={metadata} />
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
