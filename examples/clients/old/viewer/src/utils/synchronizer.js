import {DATA_TYPE} from '../constants';
import {
  loadPointCloud,
  loadImage,
  loadVehiclePose,
  loadTracklets,
  loadTimeslices
} from './data-loader';
import {experimental} from 'math.gl';
const {Pose} = experimental;

// Insert positions
const LEFT = 0;
const RIGHT = 1;

export default class Synchronizer {
  constructor({baseUrl, datasets}) {
    this.baseUrl = baseUrl;
    this.timeslices = [];
    this.datasets = {};
    this.callbacks = {};

    // Load metadata
    const loadPromises = [];
    for (const key in datasets) {
      const dataset = {
        name: key,
        path: `${baseUrl}/${key}`,
        type: datasets[key]
      };
      this.datasets[key] = dataset;

      loadPromises.push(this._loadMetadata(dataset));
    }

    Promise.all(loadPromises.filter(Boolean)).then(() => {
      if (this.callbacks.metadata) {
        this.callbacks.metadata({type: 'metadata', synchronizer: this});
      }
    });
  }

  getTimeRange() {
    return {
      start: this.timeslices[0].timestamp,
      end: this.timeslices[this.timeslices.length - 1].timestamp
    };
  }

  on(event, callback) {
    this.callbacks[event] = callback;
    return this;
  }

  getFrame(timestamp) {
    const loadPromises = [];
    const timesliceIndex = this._indexOf(timestamp, RIGHT) - 1;
    const timeslice = this.timeslices[timesliceIndex];

    if (!timeslice) {
      return null;
    }

    for (const key in this.datasets) {
      const dataset = this.datasets[key];
      loadPromises.push(this._loadAsset({dataset, timeslice}));
    }

    return Promise.all(loadPromises).then(results => {
      const frame = Object.assign({}, ...results);

      if (this.callbacks.frame) {
        this.callbacks.frame({
          type: 'frame',
          synchronizer: this,
          timestamp,
          frame
        });
      }

      return frame;
    });
  }

  _loadMetadata(dataset) {
    switch (dataset.type) {
      case DATA_TYPE.VEHICLE_POSE:
        return loadTimeslices(dataset.path).then(timeslices => {
          this.timeslices = timeslices;
        });

      case DATA_TYPE.IMAGE:
      case DATA_TYPE.POINT_CLOUD:
        return null;

      case DATA_TYPE.TRACKING:
        return loadTracklets(dataset.path).then(timeslices => {
          dataset.data = timeslices;
        });

      default:
        return null;
    }
  }

  _loadAsset({dataset, timeslice}) {
    switch (dataset.type) {
      case DATA_TYPE.POINT_CLOUD:
        return loadPointCloud(dataset.path, timeslice.filename).then(
          data =>
            data && {
              [dataset.name]: {...dataset, data}
            }
        );

      case DATA_TYPE.IMAGE:
        return loadImage(dataset.path, timeslice.filename).then(
          data =>
            data && {
              [dataset.name]: {...dataset, data}
            }
        );

      case DATA_TYPE.VEHICLE_POSE:
        return loadVehiclePose(dataset.path, timeslice.filename).then(
          data =>
            data && {
              [dataset.name]: {...dataset, data},
              vehiclePose: {
                ...data,
                pose: new Pose(data)
              }
            }
        );

      case DATA_TYPE.TRACKING:
        return Promise.resolve({
          [dataset.name]: {...dataset, data: dataset.data[timeslice.index]}
        });

      default:
        throw Error('Unknown data type');
    }
  }

  /**
   * Binary search on sorted timeslices
   * @params {number} timestamp
   * @params {number} insertPosition - insert to the left or right of the equal element.
   * @returns {number} index of insert position
   */
  _indexOf(timestamp, insertPosition = LEFT) {
    const {timeslices} = this;

    let lowerBound = 0;
    let upperBound = timeslices.length - 1;
    let currentIndex;
    let currentTimestamp;

    while (lowerBound <= upperBound) {
      currentIndex = ((lowerBound + upperBound) / 2) | 0;
      currentTimestamp = timeslices[currentIndex].timestamp;

      if (currentTimestamp < timestamp) {
        lowerBound = currentIndex + 1;
      } else if (currentTimestamp > timestamp) {
        upperBound = currentIndex - 1;
      } else {
        return insertPosition === LEFT ? currentIndex : currentIndex + 1;
      }
    }

    return lowerBound;
  }
}
