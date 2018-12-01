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
            <a
              href="https://github.com/uber/streetscape.gl/blob/master/docs/develop.md"
              className="external"
            >
              User Guide
            </a>
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
