import _ from 'lodash';
import {Vector3} from 'math.gl';
import Converter from './converter';

const ACTION_ADD = 0;
const ACTION_DELETE = 2;
const ACTION_DELETE_ALL = 3;

const NAMESPACE_SEPARATOR = '/';

/**
 * Handles converting MarkerArray messages
 */
export default class MarkerArrayConverter extends Converter {
  constructor({
    topic, /* Topic to convert */
    xvizNamespace, /* The top-level xviz namespace to use for this set of marker streams */
    acceptMarker, /* Function to filter the markers to use (if not defined, uses all markers) */
  }={}) {
    super();

    this.topic = topic;
    this.acceptMarker = acceptMarker || (() => true);

    this.markersMap = {};

    this.POLYLINE_STREAM = [xvizNamespace, 'polylines'].join(NAMESPACE_SEPARATOR);
    this.POLYGON_STREAM = [xvizNamespace, 'polygon'].join(NAMESPACE_SEPARATOR);
    this.CIRCLE_STREAM = [xvizNamespace, 'circle'].join(NAMESPACE_SEPARATOR);
    this.TEXT_STREAM = [xvizNamespace, 'text'].join(NAMESPACE_SEPARATOR);
  }

  convertFrame(frame, xvizBuilder) {
    const messages = frame[this.topic];
    if (messages) {
      for (const {message} of messages) {
        message.markers.forEach(this._processMarker);
      }
    }

    this.writeMarkers(xvizBuilder);
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.POLYLINE_STREAM)
      .coordinate('map_relative')
      .category('primitive')
      .type('polyline')
      .styleClassDefault({
        fillColor: '#ff0000',
        strokeWidth: 0.2,
        strokeWidthMinPixels: 1
      })

      .stream(this.POLYGON_STREAM)
      .coordinate('map_relative')
      .category('primitive')
      .type('polygon')
      .styleClassDefault({
        extruded: true,
        height: 0.2
      })

      .stream(this.CIRCLE_STREAM)
      .coordinate('map_relative')
      .category('primitive')
      .type('circle')
      .styleClassDefault({
        strokeWidth: 0.2
      })

      .stream(this.TEXT_STREAM)
      .category('primitive')
      .type('text')
      .styleClassDefault({
        size: 18,
        fillColor: '#0000FF'
      });
  }

  writeMarkers(xvizBuilder) {
    const WRITERS = {
      '0': this._writeArrow,
      '2': this._writeSphere,
      '4': this._writeLineStrip,
      '5': this._writeLineList,
      '9': this._writeText
    }

    _.forOwn(this.markersMap, (marker) => {
      const writer = WRITERS[marker.type];
      if (writer) {
        writer(marker, xvizBuilder);
      }
    });
  }

  _writeArrow = (marker, xvizBuilder) => {
    const points = this._mapPoints(marker.points, marker.pose);
    // Add a perpendicular-ish point to form a makeshift arrow
    points.push(
      new Vector3(...points[1])
        .rotateZ({radians: Math.PI / 24, origin: points[0]})
        .toArray()
    );

    xvizBuilder
      .stream(this.POLYLINE_STREAM)
      .color(this._toColor(marker))
      .polyline(points)
      .id(this._getMarkerId(marker));
  };

  _writeSphere = (marker, xvizBuilder) => {
    const RADIUS = marker.scale.x / 2;
    const points = this._mapPoints([
      {x: 0, y: 0, z: 0},
    ], marker.pose);

    xvizBuilder
      .stream(this.CIRCLE_STREAM)
      .circle(points[0], RADIUS)
      .color(this._toColor(marker))
      .id(this._getMarkerId(marker));
  };

  _writeLineStrip = (marker, xvizBuilder) => {
    xvizBuilder
      .stream(this.POLYLINE_STREAM)
      .color(this._toColor(marker))
      .polyline(this._mapPoints(marker.points, marker.pose))
      .id(this._getMarkerId(marker));
  };

  _writeLineList = (marker, xvizBuilder) => {
    const lines = _.chunk(marker.points, 2);
    lines.forEach((line, index) => {
      xvizBuilder
      .stream(this.POLYLINE_STREAM)
      .color(this._toColor(marker))
      .polyline(this._mapPoints(line, marker.pose))
      .id([this._getMarkerId(marker), index].join(NAMESPACE_SEPARATOR));
    });
  };

  _writeText = (marker, xvizBuilder) => {
    const points = this._mapPoints([
      {x: 0, y: 0, z: 2}, // z=2 to float above
    ], marker.pose);

    xvizBuilder
      .stream(this.TEXT_STREAM)
      .position(points[0])
      .text(marker.text);
  };

  _toColor(marker) {
    const color = marker.color || (marker.colors || [])[0];
    if (color) {
      return [color.r, color.g, color.b, color.a].map((v) => Math.round(v * 255));
    }

    return [128, 128, 128, 255]; // default color
  }

  _mapPoints(points, pose) {
    const origin = new Vector3([pose.position.x, pose.position.y, 0]);

    return points.map((p) => {
      p = [p.x, p.y, 0];
      return origin.add(p).toArray();
    });
  }

  _processMarker = (marker) => {
    const markerId = this._getMarkerId(marker);

    if (marker.action === ACTION_ADD) {
      // We only run the acceptMarker filter for ADD because we want to avoid accidentally filtering
      // out DELETE messages. It's safe to process all DELETE messages because worse case they're just a noop
      // if they don't apply
      if (this.acceptMarker(marker)) {
        this.markersMap[markerId] = marker;
      }
    }
    else if (marker.action === ACTION_DELETE) {
      if (!marker.ns) {
        this.markersMap = {};
      }
      else {
        this.markersMap = _.pickBy(this.markersMap, (value, key) => {
          // Using `startsWith` to support removing entire namespaces when an id isn't specified
          return !key.startsWith(markerId);
        });
      }
    }
    else if (marker.action === ACTION_DELETE_ALL) {
      this.markersMap = {};
    }
  };

  _getMarkerId(marker) {
    return [marker.ns, marker.id].join(NAMESPACE_SEPARATOR);
  }
}
