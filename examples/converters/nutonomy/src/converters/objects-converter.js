/* eslint-disable camelcase */
import {_getRelativeCoordinates as getRelativeCoordinates} from '@xviz/builder';
import {parseJsonFile, quaternionToEulerAngle} from '../common';
import {COORDINATE} from 'streetscape.gl';

const PALATTE = {
  ['/human/pedestrian/adult']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/human/pedestrian/child']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/human/pedestrian/wheelchair']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/human/pedestrian/personal_mobility']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/human/pedestrian/police_officer']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/human/pedestrian/construction_worker']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/human/pedestrian/stroller']: {
    fill_color: '#FEC56480',
    stroke_color: '#FEC564'
  },
  ['/animal']: {
    fill_color: '#D6A00080',
    stroke_color: '#D6A000'
  },
  ['/vehicle/car']: {
    fill_color: '#7DDDD780',
    stroke_color: '#7DDDD7'
  },
  ['/vehicle/motorcycle']: {
    fill_color: '#EEA2AD80',
    stroke_color: '#EEA2AD'
  },
  ['/vehicle/bicycle']: {
    fill_color: '#DA70BF80',
    stroke_color: '#DA70BF'
  },
  ['/vehicle/bus/bendy']: {
    fill_color: '#267E6380',
    stroke_color: '#267E63'
  },
  ['/vehicle/bus/rigid']: {
    fill_color: '#267E6380',
    stroke_color: '#267E63'
  },
  ['/vehicle/truck']: {
    fill_color: '#267E6380',
    stroke_color: '#267E63'
  },
  ['/vehicle/construction']: {
    fill_color: '#267E6380',
    stroke_color: '#267E63'
  },
  ['/vehicle/emergency/ambulance']: {
    fill_color: '#BE4A4780',
    stroke_color: '#BE4A47'
  },
  ['/vehicle/emergency/police']: {
    fill_color: '#BE4A4780',
    stroke_color: '#BE4A47'
  },
  ['/vehicle/trailer']: {
    fill_color: '#267E6380',
    stroke_color: '#267E63'
  },
  ['/movable_object/barrier']: {
    fill_color: '#6495ED80',
    stroke_color: '#6495ED'
  },
  ['/movable_object/trafficcone']: {
    fill_color: '#6495ED80',
    stroke_color: '#6495ED'
  },
  ['/movable_object/pushable_pullable']: {
    fill_color: '#6495ED80',
    stroke_color: '#6495ED'
  },
  ['/movable_object/debris']: {
    fill_color: '#6495ED80',
    stroke_color: '#6495ED'
  },
  ['/static_object/bicycle_rack']: {
    fill_color: '#8B887880',
    stroke_color: '#8B8878'
  }
};

export default class ObjectsConverter {
  constructor(rootDir, streamFile) {
    this.rootDir = rootDir;
    this.streamFile = streamFile;
    this.objectsByFrame = {};
    this.timestamps = [];

    this.OBJECTS = '/objects/objects';
    this.OBJECTS_TRACKING_POINT = '/objects/tracking_point';
  }

  load({instances}) {
    const objects = parseJsonFile(this.rootDir, this.streamFile);
    this.objectsByFrame = objects.reduce((resMap, object) => {
      if (!resMap[object.sample_token]) {
        resMap[object.sample_token] = {};
      }

      resMap[object.sample_token][object.instance_token] = this._parseObjectMetadata(
        object,
        instances
      );
      return resMap;
    }, {});
  }

  _parseObjectMetadata(object, instances) {
    const {translation, rotation, size} = object;
    const {roll, pitch, yaw} = quaternionToEulerAngle(...rotation);
    const instance = instances[object.instance_token];

    const category = instance.category;
    const bounds = [
      [-size[1] / 2, -size[0] / 2, 0],
      [-size[1] / 2, size[0] / 2, 0],
      [size[1] / 2, size[0] / 2, 0],
      [size[1] / 2, -size[0] / 2, 0],
      [-size[1] / 2, -size[0] / 2, 0]
    ];

    const poseProps = {
      x: translation[0],
      y: translation[1],
      z: translation[2],
      roll,
      pitch,
      yaw
    };

    return {
      ...object,
      ...poseProps,
      category,
      bounds,
      vertices: getRelativeCoordinates(bounds, poseProps)
    };
  }

  convertFrame(sampleToken, xvizBuilder) {
    const objects = this.objectsByFrame[sampleToken];

    if (objects) {
      Object.keys(objects).forEach((objectToken, i) => {
        const object = objects[objectToken];

        xvizBuilder
          .primitive(this.OBJECTS)
          .polygon(object.vertices)
          .classes(object.category)
          .style({
            height: object.size[2]
          })
          .id(object.token);

        xvizBuilder
          .primitive(this.OBJECTS_TRACKING_POINT)
          .circle([object.x, object.y, object.z])
          .id(object.token);
      });
    }
  }

  getMetadata(xvizMetaBuilder, {categories}) {
    const xb = xvizMetaBuilder;
    xb.stream(this.OBJECTS)
      .category('primitive')
      .type('polygon')
      .coordinate(COORDINATE.IDENTITY)

      .streamStyle({
        extruded: true,
        wireframe: true,
        fill_color: '#00000080'
      });

    Object.keys(categories).forEach(token => {
      const category = categories[token];
      xb.styleClass(category.streamName, PALATTE[category.streamName]);
    });

    xb.stream(this.OBJECTS_TRACKING_POINT)
      .category('primitive')
      .type('circle')
      .streamStyle({
        radius: 0.2,
        fill_color: '#FFFF00'
      });
  }
}
