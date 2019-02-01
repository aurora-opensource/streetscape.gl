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
import PropTypes from 'prop-types';
import {NavLink} from 'react-router-dom';

const ITEM_HEIGHT = 40;
const INDENT_BASE = 16;
const INDENT_INC = 12;

const getContentHeight = page =>
  page.children
    ? page.children.reduce((height, child) => height + getContentHeight(child), ITEM_HEIGHT)
    : ITEM_HEIGHT;

export default class TableOfContents extends Component {
  _renderPage(parentRoute, page, i) {
    const {children, name, expanded} = page;
    const path = `${parentRoute}/${page.path}`;
    const indent = INDENT_BASE + page.depth * INDENT_INC;

    if (children && page.depth === 0) {
      const maxHeight = getContentHeight(page) - ITEM_HEIGHT;

      return (
        <div key={`page-${i}`}>
          <NavLink
            className={`list-header ${expanded ? 'expanded' : ''}`}
            activeClassName="active"
            key={`group-header${i}`}
            to={path}
          >
            {name}
          </NavLink>
          <div className="subpages" style={{maxHeight}}>
            <ul key={`group-list${i}`}>{children.map(this._renderPage.bind(this, path))}</ul>
          </div>
        </div>
      );
    }

    if (children) {
      return (
        <div key={`page-${i}`}>
          <h4 style={{paddingLeft: indent}}>{name}</h4>
          <ul key={`group-list${i}`}>{children.map(this._renderPage.bind(this, path))}</ul>
        </div>
      );
    }

    const tag = page.tag && <span className="badge">{page.tag}</span>;

    if (page.external) {
      // is external link
      return (
        <li key={`page-${i}`}>
          <a
            className="link"
            style={{paddingLeft: indent}}
            href={page.external}
            target="_blank"
            rel="noopener noreferrer"
          >
            {page.name}
          </a>
          {tag}
        </li>
      );
    }

    return (
      <li key={`page-${i}`}>
        <NavLink className="link" style={{paddingLeft: indent}} to={path} activeClassName="active">
          {page.name}
        </NavLink>
        {tag}
      </li>
    );
  }

  render() {
    const {pages, parentRoute, isOpen} = this.props;

    return (
      <div className={`toc ${isOpen ? 'open' : ''}`}>
        <div>{pages.map(this._renderPage.bind(this, parentRoute))}</div>
      </div>
    );
  }
}

TableOfContents.propTypes = {
  isOpen: PropTypes.bool,
  parentRoute: PropTypes.string.isRequired,
  pages: PropTypes.arrayOf(PropTypes.object).isRequired
};
