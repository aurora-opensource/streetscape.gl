import assert from 'assert';

// NOTE: PromiseTracker is designed to work as part of redux state,
// * getState() extracts state to store in redux store
// * Constructor takes state from redux store

export default class PromiseTracker {
  static PENDING = 0;
  static RESOLVED = 1;
  static FAILURE = 2;

  constructor({callback = null} = {}) {
    this.state = {
      promiseStatus: {},
      lastReset: 0
    };
    this.callback = callback;
    Object.seal(this);
  }

  // Clears out promise status
  // Note doesn't clear out pending auto tracked promises
  reset(state) {
    this.state.promiseStatus = {};
    this.state.lastReset = Date.now();
    return this;
  }

  // Auto track a promise
  add({promise, api, id, priority, description}) {
    this.start({api, id, priority, description});
    promise
      .then(() => this.resolve({api, id, priority, description}))
      .catch(() => this.reject({api, id, priority, description}));
  }

  // Manually track a promise start
  start({api, id, priority, description}) {
    return this.setStatus({
      status: PromiseTracker.PENDING,
      id,
      priority,
      description,
      time: Date.now()
    });
  }

  // Manually track a promise resolve
  resolve({api, id, priority, description}) {
    return this.setStatus({status: PromiseTracker.RESOLVED, api, id, priority, description});
  }

  // Manually track a promise reject
  reject({api, id, priority, description}) {
    return this.setStatus({status: PromiseTracker.REJECTED, api, id, priority, description});
  }

  // Manually set status
  setStatus({status, api, id, priority, description}) {
    assert(id, 'Promise SetStatus id');
    // NOTE: Only change top level structure to ensure we can make clean "immutable' clones
    this.state.promiseStatus[id] = Object.assign({}, this.state.promiseStatus[id], {
      status,
      api,
      id,
      priority,
      description
    });

    // call application supplied callback if provided
    if (this.callback) {
      this.callback(this.state.promiseStatus[id]);
    }
    return this;
  }

  // Get a status summary
  getStatus() {
    let total = 0;
    let completed = 0;
    let failed = 0;
    let summary = [];

    for (const id in this.state.promiseStatus) {
      const promiseStatus = this.state.promiseStatus[id];
      if (promiseStatus.status === PromiseTracker.RESOLVED) {
        completed++;
      } else if (promiseStatus.status === PromiseTracker.PENDING) {
        if (promiseStatus.priority >= 0) {
          // Sort unique request summaries by priority
          summary[promiseStatus.priority] = summary[promiseStatus.priority] || {};
          summary[promiseStatus.priority][promiseStatus.description] = true;
        }
      } else if (promiseStatus.priority < 0) {
        // If priority is low, do not count as a failure
        completed++;
      } else {
        failed++;
      }
      total++;
    }

    summary = summary.filter(Boolean).map(s => Object.keys(s));

    return {
      total,
      completed,
      failed,
      summary,
      startTime: this.state.lastReset
    };
  }
}
