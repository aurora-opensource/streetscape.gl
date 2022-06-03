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

/* eslint-disable camelcase */
import {CompositeLayer} from '@deck.gl/core';
import {ScatterplotLayer, PathLayer, PolygonLayer, TextLayer} from '@deck.gl/layers';
import PointCloudLayer from './point-cloud-layer/point-cloud-layer';
// TODO/ib - Uncomment to enable binary/flat polygon arrays
// import PathLayer from './binary-path-layer/binary-path-layer';
// import PolygonLayer from './binary-polygon-layer/binary-polygon-layer';

import {XVIZObject} from '@xviz/parser';

import deepExtend from 'lodash.merge';

// not sure if necessary, just to have enums for existing primitives
const LAYER_TYPES = {
  SCATTERPLOT: 'scatterplot',
  PATH: 'path',
  POINTCLOUD: 'pointcloud',
  STADIUM: 'stadium',
  POLYGON: 'polygon',
  TEXT: 'text'
};

const XVIZ_TO_LAYER_TYPE = {
  // V1
  points2d: LAYER_TYPES.SCATTERPLOT,
  points3d: LAYER_TYPES.POINTCLOUD,
  point2d: LAYER_TYPES.SCATTERPLOT,
  circle2d: LAYER_TYPES.SCATTERPLOT,
  line2d: LAYER_TYPES.PATH,
  path2d: LAYER_TYPES.PATH,
  polygon2d: LAYER_TYPES.POLYGON,

  // V2
  point: LAYER_TYPES.POINTCLOUD,
  circle: LAYER_TYPES.SCATTERPLOT,
  polyline: LAYER_TYPES.PATH,
  polygon: LAYER_TYPES.POLYGON,
  text: LAYER_TYPES.TEXT,
  stadium: LAYER_TYPES.STADIUM
};

const STYLE_TO_LAYER_PROP = {
  [LAYER_TYPES.SCATTERPLOT]: {
    opacity: 'opacity',
    radius_min_pixels: 'radiusMinPixels',
    radius_max_pixels: 'radiusMaxPixels',
    radius: 'getRadius',
    stroked: 'stroked',
    filled: 'filled',
    stroke_width_min_pixels: 'lineWidthMinPixels',
    stroke_width_max_pixels: 'lineWidthMaxPixels',
    stroke_width: 'getLineWidth',
    stroke_color: 'getLineColor',
    fill_color: 'getFillColor'
  },
  [LAYER_TYPES.POINTCLOUD]: {
    opacity: 'opacity',
    radius_pixels: 'pointSize',
    fill_color: 'getColor',
    point_color_mode: 'colorMode',
    point_color_domain: 'colorDomain'
  },
  [LAYER_TYPES.PATH]: {
    opacity: 'opacity',
    stroke_width_min_pixels: 'widthMinPixels',
    stroke_width_max_pixels: 'widthMaxPixels',
    stroke_color: 'getColor',
    stroke_width: 'getWidth'
  },
  [LAYER_TYPES.STADIUM]: {
    opacity: 'opacity',
    radius_min_pixels: 'widthMinPixels',
    radius_max_pixels: 'widthMaxPixels',
    fill_color: 'getColor',
    radius: 'getWidth'
  },
  [LAYER_TYPES.POLYGON]: {
    opacity: 'opacity',
    stroked: 'stroked',
    filled: 'filled',
    extruded: 'extruded',
    stroke_color: 'getLineColor',
    stroke_width: 'getLineWidth',
    stroke_width_min_pixels: 'lineWidthMinPixels',
    stroke_width_max_pixels: 'lineWidthMaxPixels',
    fill_color: 'getFillColor',
    height: 'getElevation'
  },
  [LAYER_TYPES.TEXT]: {
    opacity: 'opacity',
    fill_color: 'getColor',
    font_family: 'fontFamily',
    font_weight: 'fontWeight',
    text_size: 'getSize',
    text_rotation: 'getAngle',
    text_anchor: 'getTextAnchor',
    text_baseline: 'getAlignmentBaseline'
  }
};

// Defines the way that each primitive layer type is handled in the application
const LAYER_HANDLERS = {
  [LAYER_TYPES.SCATTERPLOT]: {
    layerType: LAYER_TYPES.SCATTERPLOT,
    layerClass: ScatterplotLayer,
    // returns data to hold in state
    // updateState calls `getState({data: preprocessData})`
    preprocessData: props => {
      const {data} = props;
      if (data[0].vertices && Array.isArray(data[0].vertices[0])) {
        const processedData = data.reduce((arr, multiPoints) => {
          multiPoints.vertices.forEach(pt => {
            arr.push({...multiPoints, vertices: pt});
          });
          return arr;
        }, []);
        return processedData;
      }
      return data;
    },
    getLayerTypeProps: ({xvizLayerProps, layerProps}) => {
      const {updateTriggers} = layerProps;
      return {
        // `vertices` is used xviz V1 and `center` is used by xviz V2
        getPosition: f => f.vertices || f.center,
        updateTriggers: deepExtend(updateTriggers, {
          getFillColor: {useSemanticColor: xvizLayerProps.useSemanticColor}
        })
      };
    }
  },
  [LAYER_TYPES.STADIUM]: {
    layerType: LAYER_TYPES.STADIUM,
    layerClass: PathLayer,
    getLayerTypeProps: ({xvizLayerProps, layerProps}) => {
      const {updateTriggers} = layerProps;
      return {
        getPath: f => [f.start, f.end],
        rounded: true,
        updateTriggers: deepExtend(updateTriggers, {
          getColor: {useSemanticColor: xvizLayerProps.useSemanticColor}
        })
      };
    }
  },
  [LAYER_TYPES.POINTCLOUD]: {
    layerType: LAYER_TYPES.POINTCLOUD,
    layerClass: PointCloudLayer,
    getLayerTypeProps: ({xvizLayerProps, state}) => {
      const {data} = state;
      const length = data[0].points.length / 3;
      const colorFormat = data[0].colors && data[0].colors.length / 3 === length ? 'RGB' : 'RGBA';
      return {
        colorFormat,
        data: {
          length,
          attributes: {
            getPosition: data[0].points,
            getColor: data[0].colors
          }
        },
        vehicleRelativeTransform: xvizLayerProps.vehicleRelativeTransform,
        getPosition: p => p
      };
    }
  },
  [LAYER_TYPES.PATH]: {
    layerType: LAYER_TYPES.PATH,
    layerClass: PathLayer,
    getLayerTypeProps: ({xvizLayerProps, layerProps}) => {
      const {updateTriggers} = layerProps;
      return {
        getPath: f => f.vertices,
        updateTriggers: deepExtend(updateTriggers, {
          getColor: {useSemanticColor: xvizLayerProps.useSemanticColor}
        })
      };
    }
  },
  [LAYER_TYPES.POLYGON]: {
    layerType: LAYER_TYPES.POLYGON,
    layerClass: PolygonLayer,
    getLayerTypeProps: ({xvizLayerProps, layerProps}) => {
      const {updateTriggers} = layerProps;
      const {lightSettings, useSemanticColor, opacity} = xvizLayerProps;
      const {stroked} = layerProps;
      return {
        opacity: opacity || 1,
        lightSettings,
        wireframe: stroked,
        getPolygon: f => f.vertices,
        updateTriggers: deepExtend(updateTriggers, {
          getLineColor: {useSemanticColor},
          getFillColor: {useSemanticColor}
        })
      };
    }
  },
  [LAYER_TYPES.TEXT]: {
    layerType: LAYER_TYPES.TEXT,
    layerClass: TextLayer,
    getLayerTypeProps: ({xvizLayerProps, layerProps}) => {
      const {updateTriggers} = layerProps;
      const {useSemanticColor} = xvizLayerProps;
      return {
        getText: f => f.text,
        updateTriggers: deepExtend(updateTriggers, {
          getColor: {useSemanticColor}
        })
      };
    }
  }
};

const EMPTY_OBJECT = {};

// Access V1 style properties
const getInlineProperty = (context, propertyName, objectState) => {
  const inlineProp = objectState[propertyName];
  return inlineProp === undefined ? null : inlineProp;
};
const getStylesheetProperty = (context, propertyName, objectState) =>
  context.style.getProperty(propertyName, objectState);

// Fetch layer property from XVIZ Stylesheet or object
//
// Current resolution of property to style attribute has to deal with
//  - stylesheets taking precedence over inline style attributes
//  - style attribute names used in the application do not match those of
//    XVIZ v1
//
// TODO(twojtasz): Once XVIZ v1 is removed this logic can be simplified
// by removing the `altPropertyName` and changing the order of resolution
// to be inline, stylesheet, then default.
//
/* eslint-disable complexity */
function getProperty(context, propertyName, f = EMPTY_OBJECT) {
  let objectState = f;

  // Handle XVIZ v1 color override where our semantic color mapping
  // differs from current OCS colors.  In XVIZ v2 we should be aligned.
  if (context.useSemanticColor) {
    switch (propertyName) {
      case 'stroke_color':
      case 'fill_color':
        objectState = XVIZObject.get(f.id) || f;
        break;

      default:
      // ignore
    }
  }

  // Handle XVIZ v1 style property name mismatches and
  // setup validation function based on property name.
  let altPropertyName = null;

  switch (propertyName) {
    case 'stroke_color':
    case 'fill_color':
      altPropertyName = 'color';
      break;
    case 'stroke_width':
      altPropertyName = 'thickness';
      break;
    case 'radius':
      // v2 circle inline style
      if (f.radius) {
        return f.radius;
      }
      break;
    default:
      break;
  }

  // 1a. Property from inline style (v2) or stylesheet
  let property = getStylesheetProperty(context, propertyName, objectState);

  // 1b. Alt property from inline style (v2) or stylesheet
  if (property === null && altPropertyName) {
    property = getStylesheetProperty(context, altPropertyName, objectState);
  }

  // Backward compatibility
  if (property === null && !context.disableInlineStyling) {
    // 2a. Property from inline style (v1)
    property = getInlineProperty(context, propertyName, objectState);

    // 2b. Alt property from inline style (v1)
    if (property === null && altPropertyName) {
      property = getInlineProperty(context, altPropertyName, objectState);
    }
  }

  // 3. Property from default style
  if (property === null) {
    property = context.style.getPropertyDefault(propertyName);
  }

  if (propertyName === 'text_anchor' || propertyName === 'text_baseline') {
    // These XVIZ enumerations map to Deck.gl as lowercase strings
    property = property.toLowerCase();
  }

  return property;
}
/* eslint-enable complexity */

export default class XVIZLayer extends CompositeLayer {
  _getProperty(propertyName) {
    return getProperty(this.props, propertyName);
  }

  _getPropertyAccessor(propertyName) {
    return f => getProperty(this.props, propertyName, f);
  }

  // These props are persistent unless data type and stylesheet change
  _getDefaultLayerProps(style, styleToLayerProp) {
    const layerProps = {
      updateTriggers: {}
    };

    for (const stylePropName in styleToLayerProp) {
      const layerPropName = styleToLayerProp[stylePropName];
      const isAccessor = layerPropName.startsWith('get');
      if (isAccessor) {
        layerProps.updateTriggers[layerPropName] = {
          style: stylePropName,
          dependencies: style.getPropertyDependencies(stylePropName)
        };
      } else {
        layerProps[layerPropName] = this._getProperty(stylePropName);
      }
    }

    return layerProps;
  }

  _getLayerProps() {
    const {objectStates} = this.props;
    const {layerProps} = this.state;
    const {updateTriggers} = layerProps;

    for (const key in updateTriggers) {
      const trigger = updateTriggers[key];

      layerProps[key] = this._getPropertyAccessor(trigger.style);

      updateTriggers[key] = {...trigger};
      trigger.dependencies.forEach(stateName => {
        updateTriggers[key][stateName] = objectStates[stateName];
      });
    }

    return layerProps;
  }

  _getLayerType(data) {
    if (data.length > 0) {
      return data[0].type;
    }
    return null;
  }

  updateState({props, oldProps, changeFlags}) {
    let {type} = this.state;

    if (changeFlags.dataChanged) {
      // Pre-process data
      let data = props.data;
      const dataType = this._getLayerType(data);
      type = XVIZ_TO_LAYER_TYPE[dataType];
      // Currently, preprocessing of data is not exposed to customXVIZLayers
      // It's only available through internal primitives
      const layerHandler = LAYER_HANDLERS[type];
      if (layerHandler && layerHandler.preprocessData) {
        data = layerHandler.preprocessData(props);
      }

      this.setState({data});
    }

    if (type !== this.state.type || props.style !== oldProps.style) {
      const styleToLayerProp = STYLE_TO_LAYER_PROP[type];
      const layerProps = this._getDefaultLayerProps(props.style, styleToLayerProp);
      this.setState({type, layerProps});
    }
  }

  renderLayers() {
    const {type, data} = this.state;

    if (!type) {
      return null;
    }

    const {linkTitle, streamName, streamMetadata, objectType} = this.props;
    const layerProps = this._getLayerProps();
    const forwardProps = {
      linkTitle,
      streamName,
      objectType
    };
    // Only allows for single match of a layer to a stream
    const customXvizLayerMatch = this.props.customXVIZLayers.find(({streamMatch}) =>
      streamMatch(streamName, streamMetadata)
    );

    if (customXvizLayerMatch) {
      let primitiveLayerProps = {};
      const layerType = XVIZ_TO_LAYER_TYPE[customXvizLayerMatch.primitive];
      const parentLayerHandler = LAYER_HANDLERS[layerType];
      if (parentLayerHandler) {
        primitiveLayerProps = parentLayerHandler.getLayerTypeProps({
          xvizLayerProps: this.props,
          layerProps,
          state: this.state
        });
      }

      const LayerClass = customXvizLayerMatch.layerClass || parentLayerHandler?.layerClass;
      return new LayerClass(
        forwardProps,
        layerProps,
        this.getSubLayerProps({
          id: `${layerType ? layerType : ''}-${customXvizLayerMatch.id}`,
          data,
          ...primitiveLayerProps,
          ...customXvizLayerMatch.getSubProps({
            xvizLayerProps: this.props,
            primitiveLayerProps,
            state: this.state
          })
        })
      );
    }
    if (!LAYER_HANDLERS[type]) {
      return null;
    }

    const {layerClass: LayerClass, getLayerTypeProps} = LAYER_HANDLERS[type];
    return new LayerClass(
      forwardProps,
      layerProps,
      this.getSubLayerProps({
        id: type,
        data,
        ...getLayerTypeProps({
          xvizLayerProps: this.props,
          layerProps,
          state: this.state
        })
      })
    );
  }
}

XVIZLayer.layerName = 'XVIZLayer';
