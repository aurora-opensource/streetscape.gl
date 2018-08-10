import {spawn} from 'child_process';
import _ from 'lodash';

function createDeferred() {
  const dfd = {};
  const p = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });

  dfd.promise = p;
  return dfd;
}

/**
 * Use geographiclib's CartConvert utility to convert between lla <-> local cartesian
 */
export default class LocalCartesian {
  constructor(latitude, longitude, altitude) {
    // Forward converts from lla -> local cartesian
    this.forward = this.createConverterFunc(latitude, longitude, altitude, false);
    // Reverse goes from local cartesian -> lla
    this.reverse = this.createConverterFunc(latitude, longitude, altitude, true);
  }

  createConverterFunc(latitude, longitude, altitude, isReverse) {
    const promises = [];

    const child = spawn(
      'CartConvert',
      [`${isReverse ? '-r ' : ''}-l ${latitude} ${longitude} ${altitude}`],
      {shell: true}
    );

    child.stdin.setEncoding('utf-8');
    child.stderr.on('data', (data) => {
      data.toString().trim().split('\n').forEach((d) => {
        // promises.length check to handle if CartConvert is not installed, which will immediately
        // write an error to stderr (such as when running tests on CircleCI)
        if (promises.length) {
          promises.shift().reject(d.toString());
        }
      });
    });
    child.stdout.on('data', (data) => {
      data.toString().trim().split('\n').forEach((d) => {
        promises.shift().resolve(_.map(d.trim().split(' '), parseFloat));
      });
    });

    return function converter(a, b, c) {
      child.stdin.write(`${a} ${b} ${c}\n`);
      const p = createDeferred();
      promises.push(p);
      return p.promise;
    };
  }
}