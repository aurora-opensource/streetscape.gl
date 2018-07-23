import {CompositeLayer, ScatterplotLayer, PointCloudLayer, PolygonLayer, PathLayer} from 'deck.gl';

import {getXvizConfig, XvizObject} from '@uber/xviz';

import deepExtend from 'deep-extend';

const XVIZ_TO_LAYER_TYPE = {
  points2d: 'scatterplot',
  points3d: 'pointcloud',
  point2d: 'scatterplot',
  circle2d: 'scatterplot',
  line2d: 'path',
  path2d: 'path',
  polygon2d: 'polygon'
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
  }
};

const EMPTY_OBJECT = {};

function ensureFinite(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function getProperty(context, propertyName, f = EMPTY_OBJECT) {
  const {OBJECT_LABEL_COLOR_PALETTE, OBJECT_LABEL} = getXvizConfig();
  const DEFAULT_OBJECT_COLOR = OBJECT_LABEL_COLOR_PALETTE[OBJECT_LABEL.UNRECOGNIZED][0];

  const property = context.style.getProperty(propertyName, f);
  if (property !== null) {
    return property;
  }

  const defaultValue = context.style.getPropertyDefault(propertyName);

  // If no override, use old inline prop first
  switch (propertyName) {
    case 'strokeColor':
    case 'fillColor':
      if (context.useOdtacSemanticColor && f.id) {
        const xvizObject = XvizObject.get(f.id);
        return (xvizObject && xvizObject.semanticColor) || DEFAULT_OBJECT_COLOR;
      }
      return f.color || defaultValue;
    case 'strokeWidth':
      return ensureFinite(f.thickness, defaultValue);
    case 'radius':
      return ensureFinite(f.radius, defaultValue);
    default:
      return defaultValue;
  }
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

      if (type === 'scatterplot' && Array.isArray(data[0].vertices[0])) {
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
      streamName
    };

    switch (type) {
      case 'scatterplot':
        return new ScatterplotLayer(
          this.getSubLayerProps({
            ...forwardProps,
            ...layerProps,
            id: 'scatterplot',
            data,
            getPosition: f => f.vertices,
            updateTriggers: deepExtend(updateTriggers, {
              getColor: {
                useOdtacSemanticColor: this.props.useOdtacSemanticColor
              }
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
            getNormal: p => [0, 0, 1]
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
              getColor: {
                useOdtacSemanticColor: this.props.useOdtacSemanticColor
              }
            })
          })
        );

      case 'polygon': {
        const props = this.getSubLayerProps({
          ...forwardProps,
          ...layerProps,
          id: 'polygon',
          strokeOpacity: this.props.strokeOpacity || 1,
          fillOpacity: this.props.fillOpacity || 1,
          data,
          lightSettings,
          getPolygon: f => f.vertices,
          updateTriggers: deepExtend(updateTriggers, {
            getLineColor: {
              useOdtacSemanticColor: this.props.useOdtacSemanticColor
            },
            getFillColor: {
              useOdtacSemanticColor: this.props.useOdtacSemanticColor
            }
          })
        });

        return new PolygonLayer(props);
      }

      default:
        return null;
    }
  }
}

XvizLayer.layerName = 'XvizLayer';
