import React, {PureComponent} from 'react';
import {Tooltip, Button} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE} from './custom-styles';

const HELP_BUTTON_STYLE = {
  size: 20,
  wrapper: {
    background: 'none',
    fontSize: 14
  }
};

export default class HelpPanel extends PureComponent {
  static renderButton(props) {
    return (
      <Tooltip content="Help" style={TOOLTIP_STYLE}>
        <Button type={Button.MUTED} style={HELP_BUTTON_STYLE} {...props}>
          <i className="icon-info" />
        </Button>
      </Tooltip>
    );
  }

  render() {
    return (
      <div id="help">
        <table>
          <tbody>
            <tr>
              <td>
                <h4>3D Navigation</h4>
              </td>
            </tr>
            <tr>
              <td>Pan</td>
              <td>Mouse Left</td>
            </tr>
            <tr>
              <td>Rotate</td>
              <td>Mouse Right</td>
            </tr>
            <tr>
              <td />
              <td>Shift + Mouse Left</td>
            </tr>
            <tr>
              <td>Camera Mode</td>
              <td>Toolbar > View</td>
            </tr>
            <tr>
              <td>Reset Camera</td>
              <td>Toolbar > Reset Camera</td>
            </tr>

            <tr>
              <td>
                <h4>Interaction</h4>
              </td>
            </tr>
            <tr>
              <td>Select 3D Object</td>
              <td>Click</td>
            </tr>
            <tr>
              <td>Show/Hide Tooltip</td>
              <td>Toolbar > Get Info</td>
            </tr>

            <tr>
              <td>
                <h4>Playback</h4>
              </td>
            </tr>
            <tr>
              <td>Play / Pause</td>
              <td>Space</td>
            </tr>
            <tr>
              <td>Prev Frame</td>
              <td>Left Arrow</td>
            </tr>
            <tr>
              <td>Next Frame</td>
              <td>Right Arrow</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
