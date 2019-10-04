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
import {CompositeLayer} from '@deck.gl/core';
import {IconLayer, LineLayer, TextLayer} from '@deck.gl/layers';
import distance from '@turf/distance';
import bearing from '@turf/bearing';

// CONSTANTS
const MODE_IDLE = 0;
const MODE_DISTANCE = 1;
const MODE_ANGLE = 2;

const PARAMETERS = {
  depthTest: false,
  depthMast: false
};
const CHARACTER_SET = '0123456789-.°m ';
const HALF_PI = Math.PI / 2;

// GEOGRAPHIC CALCULATIONS
function getDistance(p1, p2) {
  const dxy = distance(p1, p2, {units: 'kilometers'}) * 1000;
  // adjust for z
  const dz = p1[2] - p2[2];
  const d = Math.sqrt(dxy * dxy + dz * dz);
  return d;
}

function getAngle(origin, p1, p2) {
  const b1 = bearing(origin, p1);
  const b2 = bearing(origin, p2);
  let angle = b1 - b2;
  if (angle < -180) {
    angle += 360;
  }
  if (angle > 180) {
    angle -= 360;
  }
  return angle;
}

function getTextAnchor(origin, p, viewport) {
  if (!origin || !p) {
    return 'start';
  }
  const projectedOrigin = viewport.project(origin);
  const projectedPoint = viewport.project(p);
  const a = Math.atan2(
    projectedPoint[1] - projectedOrigin[1],
    projectedPoint[0] - projectedOrigin[0]
  );
  return a < HALF_PI && a > -HALF_PI ? 'start' : 'end';
}

// LIFECYCLE CALLBACKS
function dataComparator(data1, data2) {
  if (data1.length !== data2.length) {
    return false;
  }
  for (let i = 0; i < data1.length; i++) {
    if (data1[i] !== data2[i]) {
      return false;
    }
  }
  return true;
}

const defaultProps = {
  onModeChange: {type: 'function', value: () => {}},
  onUpdate: {type: 'function', value: () => {}}
};

export default class TapeMeasureLayer extends CompositeLayer {
  initializeState() {
    const {eventManager} = this.context.deck;
    const events = {
      pointermove: this._onPointerMove.bind(this),
      click: this._onClick.bind(this)
    };

    eventManager.on(events);
    this.state = {
      events,
      mode: MODE_IDLE,
      originPoint: null,
      referencePoint: null,
      hoverPoint: null,
      measurement: ''
    };
  }

  finalizeState() {
    super.finalizeState();
    const {eventManager} = this.context.deck;
    eventManager.off(this.state.events);
  }

  _onPointerMove(evt) {
    if (this.state.mode === MODE_IDLE) {
      return;
    }
    const layer = this.getCurrentLayer();

    evt.stopPropagation();
    const pt = layer._getPosition(evt);
    const {originPoint, referencePoint} = layer.state;
    layer.setState({
      hoverPoint: pt
    });
    if (layer.state.mode === MODE_DISTANCE) {
      const d = getDistance(originPoint, pt);
      layer.setState({
        measurement: ` ${d.toFixed(3)} m `
      });
      layer.props.onUpdate({mode: 'distance', value: d, units: 'meters'});
    } else {
      const angle = getAngle(originPoint, referencePoint, pt);
      layer.setState({
        measurement: ` ${angle.toFixed(3)}° `
      });
      layer.props.onUpdate({mode: 'angle', value: angle, units: 'degrees'});
    }
  }

  _onClick(evt) {
    evt.stopPropagation();
    const layer = this.getCurrentLayer();

    switch (layer.state.mode) {
      case MODE_IDLE: {
        const pt = layer._getPosition(evt);
        layer.setState({
          mode: MODE_DISTANCE,
          originPoint: pt,
          hoverPoint: pt
        });
        layer.props.onModeChange({
          mode: 'distance',
          point0: pt
        });
        break;
      }

      case MODE_DISTANCE: {
        const pt = layer._getPosition(evt);
        layer.setState({
          mode: MODE_ANGLE,
          referencePoint: pt,
          hoverPoint: pt
        });
        layer.props.onModeChange({
          mode: 'angle',
          point0: layer.state.originPoint,
          point1: pt
        });
        break;
      }

      default:
        layer.setState({
          mode: MODE_IDLE,
          originPoint: null,
          referencePoint: null,
          measurement: ''
        });
        layer.props.onModeChange({
          mode: 'none'
        });
    }
  }

  _getPosition(evt) {
    const {x, y} = evt.offsetCenter;
    const {deck, viewport} = this.context;

    const info = deck.pickObject({x, y, radius: deck.props.pickingRadius, unproject3D: true});

    // TODO - fix in deck viewport.unproject()
    let z = (info && info.coordinate[2]) || 0;
    z += viewport.position[2];
    return viewport.unproject([x, y], {targetZ: z});
  }

  renderLayers() {
    const {originPoint, referencePoint, hoverPoint, measurement} = this.state;

    return [
      new LineLayer({
        id: `${this.props.id}-line`,
        data: [
          originPoint && [originPoint, hoverPoint],
          referencePoint && [originPoint, referencePoint]
        ].filter(Boolean),
        dataComparator,
        pickable: false,
        parameters: PARAMETERS,
        getSourcePosition: d => d[0],
        getTargetPosition: d => d[1],
        getWidth: 1,
        getColor: [0, 0, 0],
        widthUnits: 'pixels'
      }),
      new IconLayer({
        id: `${this.props.id}-marker`,
        data: [originPoint, referencePoint].filter(Boolean),
        dataComparator,
        pickable: false,
        parameters: PARAMETERS,
        iconAtlas: './assets/icons.png',
        iconMapping: './assets/icons.json',
        getPosition: d => d,
        getSize: 40,
        sizeUnits: 'pixels',
        getIcon: (_, {index}) => (index ? 'reference' : 'origin')
      }),
      new TextLayer({
        data: [hoverPoint].filter(Boolean),
        dataComparator,
        pickable: false,
        parameters: PARAMETERS,
        characterSet: CHARACTER_SET,
        getPosition: d => d,
        getText: d => measurement,
        updateTriggers: {
          getText: measurement
        },
        getSize: 24,
        getTextAnchor: getTextAnchor(originPoint, hoverPoint, this.context.viewport)
      })
    ];
  }
}

TapeMeasureLayer.layerName = 'TapeMeasureLayer';
TapeMeasureLayer.defaultProps = defaultProps;
