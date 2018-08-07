// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

// import {SolidPolygonLayer} from '@deck.gl/layers'; // Not exported
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';

// Polygon geometry generation is managed by the polygon tesselator
import BinaryPolygonTesselator from './binary-polygon-tesselator';

export default class BinaryPolygonLayer extends SolidPolygonLayer {
  updateGeometry({props, oldProps, changeFlags}) {
    const geometryConfigChanged =
      changeFlags.dataChanged ||
      (changeFlags.updateTriggersChanged &&
        (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon));

    // When the geometry config  or the data is changed,
    // tessellator needs to be invoked
    if (geometryConfigChanged) {
      // TODO - avoid creating a temporary array here: let the tesselator iterate
      const polygons = props.data.map(props.getPolygon);

      this.setState({
        polygonTesselator: new BinaryPolygonTesselator({polygons, IndexType: this.state.IndexType})
      });

      this.state.attributeManager.invalidateAll();
    }

    if (
      geometryConfigChanged ||
      props.extruded !== oldProps.extruded ||
      props.fp64 !== oldProps.fp64
    ) {
      this.state.polygonTesselator.updatePositions({
        fp64: props.fp64,
        extruded: props.extruded
      });
    }
  }

  /*
  calculateIndices(attribute) {
    attribute.value = this.state.polygonTesselator.indices();
    const numVertex = attribute.value.length / attribute.size;
    this.setState({numVertex});
  }

  calculatePositions(attribute) {
    attribute.value = this.state.polygonTesselator.positions();
    const numInstances = attribute.value.length / attribute.size;
    this.setState({numInstances});
  }
  calculatePositionsLow(attribute) {
    const isFP64 = this.is64bitEnabled();
    attribute.isGeneric = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    attribute.value = this.state.polygonTesselator.positions64xyLow();
  }

  calculateNextPositions(attribute) {
    attribute.value = this.state.polygonTesselator.nextPositions();
  }
  calculateNextPositionsLow(attribute) {
    const isFP64 = this.is64bitEnabled();
    attribute.isGeneric = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    attribute.value = this.state.polygonTesselator.nextPositions64xyLow();
  }

  calculateElevations(attribute) {
    const {extruded, getElevation} = this.props;
    if (extruded && typeof getElevation === 'function') {
      attribute.isGeneric = false;
      attribute.value = this.state.polygonTesselator.elevations({
        getElevation: polygonIndex => getElevation(this.props.data[polygonIndex])
      });
    } else {
      const elevation = extruded ? getElevation : 0;
      attribute.isGeneric = true;
      attribute.value = new Float32Array([elevation]);
    }
  }

  calculateFillColors(attribute) {
    attribute.value = this.state.polygonTesselator.colors({
      key: 'fillColors',
      getColor: polygonIndex => this.props.getFillColor(this.props.data[polygonIndex])
    });
  }

  calculateLineColors(attribute) {
    attribute.value = this.state.polygonTesselator.colors({
      key: 'lineColors',
      getColor: polygonIndex => this.props.getLineColor(this.props.data[polygonIndex])
    });
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    attribute.value = this.state.polygonTesselator.pickingColors();
  }
  */
}

BinaryPolygonLayer.layerName = 'BinaryPolygonLayer';
