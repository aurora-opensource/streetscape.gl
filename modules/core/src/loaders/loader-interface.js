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

/**
 * This class defines the interface for Loader classes. A Loader is factually
 * a store holding state for connected components. We call the subclasses of this
 * interface "Loaders" and not simply "Stores" because they are is usually also
 * responsible for loading data in addition of storing it.
 *
 * The pattern of a Loader is very similar to the Redux store.
 * We provide a "connect()" High Order Component (H.O.C.) to connect React
 * components to Loader instances. Connected components will react to the loader's
 * state changes, very much like React components react to the Redux's store state
 * changes when they are connected it via the Redux connect() HOC.
 *
 * @example
 *
 * // Define and instantiate a new loader.
 * class MyLoader extends LoaderInterface {
 *   // Some arbitrary internal method that will store the loaded data
 *   _onMessage(msg) {
 *     this.set('foo', msg.foo);
 *     this.set('bar', msg.bar);
 *   }
 * }
 * const loader = new MyLoader(...opts);
 *
 * // Create a new component that will connect to the loader state.
 * const MyComponent = props => <div>{props.foo}:{props.bar}</div>;
 *
 * // Connect component to the loader.
 * import {connect} from 'streetscape.gl';
 * const mapStateToProps = loader => ({
 *     foo: loader.get('foo'),
 *     bar: loader.get('bar')
 * });
 * const MyConnectedComponent = connect(mapStateToProps, MyComponent);
 *
 * // Render connected component somewhere and feed it the loader. It will
 * // react to the loader state changes.
 * <MyConnectedComponent loader={loader} />
 */
export default class LoaderInterface {
  constructor() {
    this.listeners = [];
    this.state = {};
    this._updates = 0;
    this._version = 0;
    this._updateTimer = null;
  }

  subscribe(instance) {
    this.listeners.push(instance);
  }

  unsubscribe(instance) {
    const index = this.listeners.findIndex(o => o === instance);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this._version++;
      if (!this._updateTimer) {
        /* global requestAnimationFrame */
        this._updateTimer = requestAnimationFrame(this._update);
      }
    }
  }

  _update = () => {
    this._updateTimer = null;
    this.listeners.forEach(o => o(this._version));
  };

  _bumpDataVersion() {
    this._updates++;
    this.set('dataVersion', this._updates);
  }

  _getDataVersion = () => this.get('dataVersion');
}
