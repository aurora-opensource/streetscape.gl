import {CompositeLayer} from '@deck.gl/core';
import {
  PointCloudLayer,
  ScatterplotLayer,
  PathLayer,
  PolygonLayer,
  TextLayer
} from '@deck.gl/layers';
// TODO/ib - Uncomment to enable binary/flat polygon arrays
// import PathLayer from './binary-path-layer/binary-path-layer';
// import PolygonLayer from './binary-polygon-layer/binary-polygon-layer';

import {XvizObject} from '@xviz/parser';

import deepExtend from 'deep-extend';

const XVIZ_TO_LAYER_TYPE = {
  // V1
  points2d: 'scatterplot',
  points3d: 'pointcloud',
  point2d: 'scatterplot',
  circle2d: 'scatterplot',
  line2d: 'path',
  path2d: 'path',
  polygon2d: 'polygon',

  // V2
  point: 'pointcloud',
  circle: 'scatterplot',
  polyline: 'path',
  polygon: 'polygon',
  text: 'text'
};

const STYLE_TO_LAYER_PROP = {
  scatterplot: {
    opacity: 'opacity',
    radiusMinPixels: 'radiusMinPixels',
    radiusMaxPixels: 'radiusMaxPixels',
    radius: 'getRadius',
    fillColor: 'getColor'
  },
  pointcloud: {
    opacity: 'opacity',
    radiusPixels: 'radiusPixels',
    fillColor: 'getColor'
  },
  path: {
    opacity: 'opacity',
    strokeWidthMinPixels: 'widthMinPixels',
    strokeWidthMaxPixels: 'widthMaxPixels',
    strokeColor: 'getColor',
    strokeWidth: 'getWidth'
  },
  polygon: {
    opacity: 'opacity',
    stroked: 'stroked',
    filled: 'filled',
    extruded: 'extruded',
    wireframe: 'wireframe',
    strokeColor: 'getLineColor',
    strokeWidth: 'getLineWidth',
    fillColor: 'getFillColor',
    height: 'getElevation'
  },
  text: {
    opacity: 'opacity',
    fillColor: 'getColor',
    size: 'getSize',
    angle: 'getAngle',
    textAnchor: 'getTextAnchor',
    alignmentBaseline: 'getAlignmentBaseline'
  }
};

const EMPTY_OBJECT = {};

function ensureFinite(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

const getInlineProperty = (context, propertyName, objectState) => objectState[propertyName];
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
      case 'strokeColor':
      case 'fillColor':
        objectState = XvizObject.get(f.id) || f;
        break;

      default:
      // ignore
    }
  }

  // Handle XVIZ v1 style property name mismatches and
  // setup validation function based on property name.
  let altPropertyName = null;
  let propertyValidation = null;

  switch (propertyName) {
    case 'strokeColor':
    case 'fillColor':
      altPropertyName = 'color';
      break;
    case 'strokeWidth':
      altPropertyName = 'thickness';
      propertyValidation = ensureFinite;
      break;
    case 'radius':
      propertyValidation = ensureFinite;
      break;
    default:
      break;
  }

  // 1a. Property from stylesheet
  // 1b. Alt property from stylesheet
  // 2a. Property from inline style
  // 2b. Alt property from inline style
  // 3. Property from default style
  const defaultValue = context.style.getPropertyDefault(propertyName);

  const propertyAccessors = [getStylesheetProperty, getInlineProperty];
  if (context.disableInlineStyling) {
    propertyAccessors.splice(1, 1);
  }

  for (const fetchProperty of propertyAccessors) {
    for (const propName of [propertyName, altPropertyName].filter(Boolean)) {
      const property = fetchProperty(context, propName, objectState);
      if (property !== null && property !== undefined) {
        return propertyValidation ? propertyValidation(property, defaultValue) : property;
      }
    }
  }

  return defaultValue;
}
/* eslint-enable complexity */

export default class XvizLayer extends CompositeLayer {
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

  updateState({props, oldProps, changeFlags}) {
    let {type} = this.state;

    if (changeFlags.dataChanged) {
      // Pre-process data
      let data = props.data;
      const dataType = data.length > 0 && data[0].type;
      type = XVIZ_TO_LAYER_TYPE[dataType];

      if (type === 'scatterplot' && data[0].vertices && Array.isArray(data[0].vertices[0])) {
        // is multi point
        data = data.reduce((arr, multiPoints) => {
          multiPoints.vertices.forEach(pt => {
            arr.push({...multiPoints, vertices: pt});
          });
          return arr;
        }, []);
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
    const {lightSettings} = this.props;
    const {type, data} = this.state;

    if (!type) {
      return null;
    }

    const {linkTitle, streamName, objectType} = this.props;
    const layerProps = this._getLayerProps();
    const updateTriggers = layerProps.updateTriggers;
    const forwardProps = {
      linkTitle,
      streamName,
      objectType
    };

    switch (type) {
      case 'scatterplot':
        return new ScatterplotLayer(
          this.getSubLayerProps({
            ...forwardProps,
            ...layerProps,
            id: 'scatterplot',
            data,
            getPosition: f => f.vertices || f.center,
            updateTriggers: deepExtend(updateTriggers, {
              getColor: {useSemanticColor: this.props.useSemanticColor}
            })
          })
        );

      case 'pointcloud':
        return new PointCloudLayer(
          this.getSubLayerProps({
            ...forwardProps,
            ...layerProps,
            id: 'pointcloud',
            data: data[0].vertices,
            getPosition: p => p,
            getNormal: [0, 0, 1]
          })
        );

      case 'path':
        return new PathLayer(
          this.getSubLayerProps({
            ...forwardProps,
            ...layerProps,
            id: 'path',
            data,
            getPath: f => f.vertices,
            updateTriggers: deepExtend(updateTriggers, {
              getColor: {useSemanticColor: this.props.useSemanticColor}
            })
          })
        );

      case 'polygon': {
        const props = this.getSubLayerProps({
          ...forwardProps,
          ...layerProps,
          id: 'polygon',
          opacity: this.props.opacity || 1,
          data,
          lightSettings,
          getPolygon: f => f.vertices,
          updateTriggers: deepExtend(updateTriggers, {
            getLineColor: {useSemanticColor: this.props.useSemanticColor},
            getFillColor: {useSemanticColor: this.props.useSemanticColor}
          })
        });

        return new PolygonLayer(props);
      }

      case 'text':
        return new TextLayer(
          this.getSubLayerProps({
            ...forwardProps,
            ...layerProps,
            id: 'text',
            data,
            getText: f => f.text,
            updateTriggers: deepExtend(updateTriggers, {
              getColor: {useSemanticColor: this.props.useSemanticColor}
            })
          })
        );

      default:
        return null;
    }
  }
}

XvizLayer.layerName = 'XvizLayer';
