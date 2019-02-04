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

import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';

import {
  FRAMEWORK_LINKS,
  FRAMEWORK_NAME,
  XVIZ_GITHUB_URL,
  STREETSCAPE_GITHUB_URL
} from '../contents/links';

export default class Header extends Component {
  _renderLinks() {
    const links = Object.keys(FRAMEWORK_LINKS).filter(name => name !== FRAMEWORK_NAME);
    return (
      <div className="site-links">
        <div className="site-link" key={FRAMEWORK_NAME}>
          <a href="#">{FRAMEWORK_NAME}</a>
        </div>
        {links.map(name => (
          <div className="site-link" key={name}>
            <a href={FRAMEWORK_LINKS[name]}>{name}</a>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const {isMenuOpen, opacity, toggleMenu} = this.props;

    return (
      <header className={isMenuOpen ? 'open' : ''}>
        <div className="bg" style={{opacity}} />
        <div className="container stretch">
          <a className="logo" href="#">
            {FRAMEWORK_NAME}
          </a>
          {this._renderLinks()}
          <div className="menu-toggle" onClick={() => toggleMenu(!isMenuOpen)}>
            <i className={`icon icon-${isMenuOpen ? 'close' : 'menu'}`} />
          </div>
          <div className="links">
            <NavLink activeClassName="active" to="/about">
              About
            </NavLink>
            <NavLink activeClassName="active" to="/xviz">
              XVIZ
            </NavLink>
            <a href={XVIZ_GITHUB_URL} className="external">
              <i className="icon icon-github" />
            </a>
            <NavLink activeClassName="active" to="/streetscape.gl">
              streetscape.gl
            </NavLink>
            <a href={STREETSCAPE_GITHUB_URL} className="external">
              <i className="icon icon-github" />
            </a>
          </div>
        </div>
      </header>
    );
  }
}
