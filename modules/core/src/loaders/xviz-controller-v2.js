import assert from 'assert';

/* XVIZ Controller
 *
 * XVIZController should present a uniform base object interface (as much as possible)
 * such that application logic doesn't need to know the difference between the protocols.
 *
 * Intention is to add bi-directional protocol concepts:
 *  - stop
 *  - seek
 *  - pause
 *  ...
 */

/* XVIZControllerV1
 *
 * XVIZ v1 handler that opens the log on connetion and closes when 'done' is received.
 */
export default class XVIZControllerV2 {
  constructor(socket) {
    assert(socket, 'XVIZ socket');
    this.socket = socket;
    this.transformCounter = 0;
  }

  _send(type, message) {
    const msg = {type: `xviz/${type}`, data: message};
    this.socket.send(JSON.stringify(msg));
  }

  transformLog({startTimestamp, endTimestamp} = {}) {
    const msg = {};
    if (startTimestamp) {
      msg.start_timestamp = startTimestamp; // eslint-disable-line camelcase
    }

    if (endTimestamp) {
      msg.end_timestamp = endTimestamp; // eslint-disable-line camelcase
    }

    // Add in a sequential id
    msg.id = `${this.transformCounter}`;
    this.transformCounter++;

    this._send('transform_log', msg);
  }
}
