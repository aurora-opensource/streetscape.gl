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
export class XVIZControllerV1 {
  constructor(socket) {
    assert(socket, 'XVIZ socket');
    this.socket = socket;
  }

  onMessage(message) {
    // Nothing in v1
  }

  play({timestamp, duration}) {
    const openLogMsg = {type: 'open_log', duration};
    if (timestamp) {
      openLogMsg.timestamp = timestamp;
    }

    this.socket.send(JSON.stringify(openLogMsg));
  }
}
