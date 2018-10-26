/* eslint-disable camelcase */
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
    radius_min_pixels: 'radiusMinPixels',
    radius_max_pixels: 'radiusMaxPixels',
    radius: 'getRadius',
    fill_color: 'getColor'
  },
  pointcloud: {
    opacity: 'opacity',
    radius_pixels: 'radiusPixels',
    fill_color: 'getColor'
  },
  path: {
    opacity: 'opacity',
    stroke_width_min_pixels: 'widthMinPixels',
    stroke_width_max_pixels: 'widthMaxPixels',
    stroke_color: 'getColor',
    stroke_width: 'getWidth'
  },
  polygon: {
    opacity: 'opacity',
    stroked: 'stroked',
    filled: 'filled',
    extruded: 'extruded',
    wireframe: 'wireframe',
    stroke_color: 'getLineColor',
    stroke_width: 'getLineWidth',
    fill_color: 'getFillColor',
    height: 'getElevation'
  },
  text: {
    opacity: 'opacity',
    fill_color: 'getColor',
    size: 'getSize',
    angle: 'getAngle',
    text_anchor: 'getTextAnchor',
    alignment_baseline: 'getAlignmentBaseline'
  }
};

const EMPTY_OBJECT = {};

// Access V1 and V2 style properties
const getInlineProperty = (context, propertyName, objectState) => {
  let inlineProp = objectState[propertyName];
  if (inlineProp === undefined) {
    inlineProp = objectState.style && objectState.style[propertyName];
  }
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
        objectState = XvizObject.get(f.id) || f;
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
      break;
    default:
      break;
  }

  // 1a. Property from stylesheet
  let property = getStylesheetProperty(context, propertyName, objectState);

  // 1b. Alt property from stylesheet
  if (property === null && altPropertyName) {
    property = getStylesheetProperty(context, altPropertyName, objectState);
  }

  if (property === null && !context.disableInlineStyling) {
    // 2a. Property from inline style
    property = getInlineProperty(context, propertyName, objectState);

    // 2b. Alt property from inline style
    if (property === null && altPropertyName) {
      property = getInlineProperty(context, altPropertyName, objectState);
    }
  }

  // 3. Property from default style
  if (property === null) {
    property = context.style.getPropertyDefault(propertyName);
  }

  return property;
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
            // `vertices` is used xviz V1 and `center` is used by xviz V2
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
