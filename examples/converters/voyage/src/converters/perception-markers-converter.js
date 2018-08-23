import _ from 'lodash';
import {Vector3} from 'math.gl';
import {TRACKS_MARKERS} from '~/topics';

const ACTION_ADD = 0;
const ACTION_DELETE = 2;
const ACTION_DELETE_ALL = 3;

const NAMESPACE_SEPARATOR = '/';

export default class PerceptionMarkersConverter {
  constructor(namespace, filterNs=null) {
    this.filterNs = filterNs;
    this.POLYLINE_STREAM = [namespace, 'polylines'].join(NAMESPACE_SEPARATOR);
    this.markers = {};
  }

  convertFrame(frame, xvizBuilder) {
    const messages = frame[TRACKS_MARKERS];
    if (messages) {
      for (const {message} of messages) {
        message.markers.forEach(this._processMarker);
      }
    }

    this._writeMarkers(xvizBuilder);
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
      });
  }

  _writeMarkers(xvizBuilder) {
    // console.log('WRITE MARKERS', this.markers);
    // console.log(_.mapValues(this.markers, (m) => JSON.stringify(_.pick(m, ['id', 'ns', 'type', 'color']))));

    const WRITERS = {
      '0': this._writeArrow,
      '4': this._writeLineStrip,
      '5': this._writeLineList
    }

    _.forOwn(this.markers, (marker) => {
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
      .color(this._toColor(marker.color))
      .polyline(points)
      .id(this._getMarkerId(marker));
  };

  _writeLineStrip = (marker, xvizBuilder) => {
    xvizBuilder
      .stream(this.POLYLINE_STREAM)
      .color(this._toColor(marker.color))
      .polyline(this._mapPoints(marker.points, marker.pose))
      .id(this._getMarkerId(marker));
  };

  _writeLineList = (marker, xvizBuilder) => {
    const lines = _.chunk(marker.points, 2);
    lines.forEach((line, index) => {
      xvizBuilder
      .stream(this.POLYLINE_STREAM)
      .color(this._toColor(marker.color))
      .polyline(this._mapPoints(line, marker.pose))
      .id([this._getMarkerId(marker), index].join(NAMESPACE_SEPARATOR));
    });
  };

  _toColor(color) {
    return [color.r, color.g, color.b, color.a].map((v) => Math.round(v * 255));
  }

  _mapPoints(points, pose) {
    const origin = new Vector3([pose.position.x, pose.position.y, 0]);

    return points.map((p) => {
      p = [p.x, p.y, 0];
      return origin.add(p).toArray();
    });
  }

  _processMarker = (marker) => {
    if (this.filterNs && marker.ns && !_.includes(this.filterNs, marker.ns)) {
      return;
    }

    const markerId = this._getMarkerId(marker);

    if (marker.action === ACTION_ADD) {
      this.markers[markerId] = marker;
    }
    else if (marker.action === ACTION_DELETE) {
      if (!marker.ns) {
        this.markers = {};
      }
      else {
        this.markers = _.pickBy(this.markers, (value, key) => {
          // Using `startsWith` to support removing entire namespaces when an id isn't specified
          return !key.startsWith(markerId);
        });
      }
    }
    else if (marker.action === ACTION_DELETE_ALL) {
      this.markers = {};
    }
  };

  _getMarkerId(marker) {
    return [marker.ns, marker.id].join(NAMESPACE_SEPARATOR);
  }
}
