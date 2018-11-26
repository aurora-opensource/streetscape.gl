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
import {Redirect} from 'react-router';

import TableOfContents from './table-of-contents';
import MarkdownPage from './markdown-page';

function getDefaultPath(pages) {
  if (!pages || !pages.length) {
    return [];
  }
  const page = pages[0];
  return [page.path].concat(getDefaultPath(page.children));
}

// We can't use <Route> here because for viewport transition to work, <Page> cannot be unmounted
function findPage(pages, path) {
  const firstPage = path.shift();
  const page = pages.find(p => p.path === firstPage);

  if (!page) {
    return {redirect: getDefaultPath(pages)};
  }
  if (page.children) {
    const result = findPage(page.children, path);
    if (result.page) {
      return result;
    }
    return {redirect: [firstPage].concat(result.redirect)};
  }
  if (path.length) {
    return {redirect: []};
  }
  return {page};
}

export default class Gallery extends Component {
  _updateQueryString = queryString => {
    const {history} = this.props;
    const {location, search} = history;

    if (search !== queryString) {
      history.replace({
        pathname: location.pathname,
        search: queryString
      });
    }
  };

  _renderPage() {
    const {match, location, pages} = this.props;
    const path = location.pathname
      .replace(match.path, '')
      .split('/')
      .filter(Boolean);
    const {page, redirect} = findPage(pages, path);

    if (redirect) {
      return <Redirect from="*" to={`${match.path}/${redirect.join('/')}`} />;
    }

    return (
      <MarkdownPage updateQueryString={this._updateQueryString} location={location} page={page} />
    );
  }

  render() {
    const {
      match: {path},
      pages,
      isMenuOpen
    } = this.props;

    return (
      <div className="gallery-wrapper">
        <div className="flexbox--row">
          <div className="flexbox-item" style={{zIndex: 1}}>
            <TableOfContents parentRoute={path} pages={pages} isOpen={isMenuOpen} />
          </div>
          <div className={'flexbox-item flexbox-item--fill'}>{this._renderPage()}</div>
        </div>
      </div>
    );
  }
}
