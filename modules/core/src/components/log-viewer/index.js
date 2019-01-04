import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {setObjectState} from '../../utils/object-state';

import Core3DViewer from './core-3d-viewer';
import HoverTooltip from './hover-tooltip';

import connectToLog from '../connect';

const noop = () => {};
const preventDefault = evt => evt.preventDefault();

class LogViewer extends PureComponent {
  static propTypes = {
    ...Core3DViewer.propTypes,

    // Props from loader
    frame: PropTypes.object,
    metadata: PropTypes.object,

    // Rendering options
    renderTooltip: PropTypes.func,
    style: PropTypes.object,

    // Callbacks
    onSelectObject: PropTypes.func,
    onContextMenu: PropTypes.func,
    onViewStateChange: PropTypes.func,
    onObjectStateChange: PropTypes.func,

    // Optional: to use with external state management (e.g. Redux)
    viewState: PropTypes.object,
    viewOffset: PropTypes.object,
    objectStates: PropTypes.object
  };

  static defaultProps = {
    style: {},
    onViewStateChange: noop,
    onObjectStateChange: noop,
    onSelectObject: noop,
    onContextMenu: noop,
    getTransformMatrix: (streamName, context) => null
  };

  constructor(props) {
    super(props);

    this.state = {
      viewState: {
        width: 1,
        height: 1,
        longitude: 0,
        latitude: 0,
        zoom: 18,
        pitch: 20,
        bearing: 0,
        ...props.viewMode.initialProps
      },
      viewOffset: {
        x: 0,
        y: 0,
        bearing: 0
      },
      objectStates: {},
      hoverInfo: null
    };
  }

  _onViewStateChange = ({viewState, viewOffset}) => {
    this.setState({viewState, viewOffset});
    this.props.onViewStateChange({viewState, viewOffset});
  };

  _onHoverObject = (info, evt) => {
    if (this.props.showTooltip && info && info.object) {
      this.setState({hoverInfo: info});
    } else if (this.state.hoverInfo) {
      this.setState({hoverInfo: null});
    }
  };

  _onClickObject = (info, evt) => {
    const objectId = info && info.object && info.object.id;

    if (objectId && !this.props.onSelectObject(info, evt)) {
      // User callback did not mark event as handled, proceed with default behavior
      // Select object
      let {objectStates} = this.state;
      const isObjectSelected = objectStates.selected && objectStates.selected[objectId];

      objectStates = setObjectState(objectStates, {
        stateName: 'selected',
        id: objectId,
        value: !isObjectSelected
      });

      this.setState({objectStates});
      this.props.onObjectStateChange(objectStates);
    }
  };

  _onContextMenu = (info, evt) => {
    this.props.onContextMenu(info, evt);
  };

  _renderTooltip() {
    const {showTooltip, style, renderTooltip} = this.props;
    const {hoverInfo} = this.state;

    return (
      showTooltip &&
      hoverInfo && (
        <HoverTooltip info={hoverInfo} style={style.tooltip} renderContent={renderTooltip} />
      )
    );
  }

  render() {
    const viewState = this.props.viewState || this.state.viewState;
    const viewOffset = this.props.viewOffset || this.state.viewOffset;
    const objectStates = this.props.objectStates || this.state.objectStates;

    return (
      <div onContextMenu={preventDefault}>
        <Core3DViewer
          {...this.props}
          onViewStateChange={this._onViewStateChange}
          onClick={this._onClickObject}
          onHover={this._onHoverObject}
          onContextMenu={this._onContextMenu}
          viewState={viewState}
          viewOffset={viewOffset}
          objectStates={objectStates}
        >
          {this._renderTooltip()}
        </Core3DViewer>
      </div>
    );
  }
}

const getLogState = log => ({
  frame: log.getCurrentFrame(),
  metadata: log.getMetadata()
});

export default connectToLog({getLogState, Component: LogViewer});
