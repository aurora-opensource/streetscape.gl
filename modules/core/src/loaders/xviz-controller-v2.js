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
  }

  _send(message) {
    this.socket.send(JSON.stringify(message));
  }

  open({timestamp, duration}) {
    const msg = {type: 'open', duration};
    if (timestamp) {
      msg.timestamp = timestamp;
    }
    this._send(msg);
  }

  metadata() {
    const msg = {type: 'metadata'};
    this._send(msg);
  }

  play({timestamp, duration}) {
    const msg = {type: 'play', timestamp, duration};
    this._send(msg);
  }
}
