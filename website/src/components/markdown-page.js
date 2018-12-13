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

/* global fetch */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import marked from 'marked';
import {markdownFiles} from '../contents/pages';

/* Markdown renderer */
marked.setOptions({
  // code highlight
  highlight: code => {
    return require('highlight.js').highlightAuto(code).value;
  }
});
const renderer = new marked.Renderer();

function getLinkPath(repo, path, hash = '') {
  const filepath = `${repo}-${path}`;
  if (hash[0] === '#') {
    hash = hash.slice(1);
  }
  const route = markdownFiles[filepath];
  if (!route) {
    console.warn('Cannot find linked doc: ', filepath); // eslint-disable-line
  }
  return `#/${route}${hash ? '?section=' : ''}${hash}`;
}

/**
 * This map allows you to rewrite urls present in the markdown files
 * to be rewritted to point to other targets. It is useful so that
 * links can works both by browsing the docs using the Github explorer
 * and on the website.
 *
 * If rewrite returns a falsy value, it will transform the link to a simple
 * text, in case you don't want this link to point to anything.
 */
const urlRewrites = [
  {
    test: /https:\/\/github\.com\/uber\/(streetscape\.gl|xviz)\/.*\/(docs\/.+?\.md)(#.+)?$/,
    rewrite: (href, match) => getLinkPath(match[1], match[2], match[3])
  },
  {
    /*
     * Look for urls in the form of
     * `/docs/path/to/file.md#header`
     * and convert to
     * `#/documentation/path/to/page?section=header`
     */
    test: /^\/(docs\/.+?\.md)(#.+)?$/,
    rewrite: (href, match) => getLinkPath(renderer._root, match[1], match[2])
  },
  {
    test: /^#.+$/,
    rewrite: (href, match) => getLinkPath(renderer._root, renderer._path, match[0])
  }
];

const imageRewrites = [
  {
    /* Resolve relative links */
    test: /^\./,
    rewrite: (href, match) => `${renderer._dirname}${href}`
  }
];

/* Look for demo injection tag */
const INJECTION_REG = /<!-- INJECT:"(.+)\" -->/g;

// links override
renderer.link = (href, title, text) => {
  let to = href;

  for (const rule of urlRewrites) {
    if (to && rule.test.test(to)) {
      to = rule.rewrite(to, to.match(rule.test));
      break;
    }
  }

  return to ? `<a href=${to}>${text}</a>` : `<span>${text}</span>`;
};
// images override
renderer.image = (href, title, text) => {
  let src = href;

  for (const rule of imageRewrites) {
    if (src && rule.test.test(src)) {
      src = rule.rewrite(src, src.match(rule.test));
      break;
    }
  }
  return `<img src="${src}" title="${title || text}" alt="${text}" />`;
};

function renderMarkdown(content, {markdown, root}) {
  renderer._root = root;
  renderer._dirname = markdown.replace(/[^\/]*$/, '');
  renderer._path = markdown.slice(markdown.indexOf('docs/'));
  return marked(content, {renderer});
}

export default class MarkdownPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {html: ''};
    this._anchorPositions = null;
    this._currentSection = null;
    this._internalScroll = false;
  }

  componentDidMount() {
    this._loadPage(this.props.page);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this._anchorPositions = null;
      this._currentSection = '.';
      this._loadPage(nextProps.page);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.html !== this.state.html || prevProps.location !== this.props.location) {
      this._jumpTo(this.props.location);
    }
  }

  _loadPage(page) {
    if (page.content) {
      this.setState({html: renderMarkdown(page.content, page)});
    } else if (page.markdown) {
      fetch(page.markdown)
        .then(resp => resp.text())
        .then(content => {
          page.content = content;
          this.setState({html: renderMarkdown(content, page)});
        });
    }
  }

  // get the vertical scroll position of a DOM object relative to this component
  _getScrollPosition(object) {
    const {container} = this.refs;
    // give the header some breath room
    let top = -28;
    while (object && Number.isFinite(object.offsetTop) && object !== container) {
      top += object.offsetTop;
      object = object.parentNode;
    }
    return top;
  }

  // Because we use hash paths in react-router, hash jump links do not work
  // In-page links can be passed using ?section=<id>
  _jumpTo({search}) {
    let section = search.match(/section=([^\?&]+)/);
    section = section && section[1];
    let scrollTop = 0;

    if (section === this._currentSection) {
      return;
    }
    if (section) {
      const anchor = this.refs.container.querySelector(`#${section.toLowerCase()}`);
      scrollTop = this._getScrollPosition(anchor);
    }

    if (this.refs.container.scrollTop !== scrollTop) {
      this._internalScroll = true;
      this.refs.container.scrollTop = scrollTop;
    }
  }

  // Find the current section and update the query string.
  // This helps preserve the scroll position when navigating cross pages.
  _onScroll(evt) {
    if (this._internalScroll) {
      // do not react to scrolling set by _jumpTo
      this._internalScroll = false;
      return;
    }

    let {_anchorPositions} = this;
    const top = evt.target.scrollTop;

    // Calculate all scroll positions of h2, h3 once
    if (!_anchorPositions) {
      _anchorPositions = {};
      // generate mapping of anchor id -> scrollTop
      const anchors = this.refs.container.querySelectorAll('h2[id],h3[id],h4[id],h5[id]');
      for (const anchor of anchors) {
        _anchorPositions[anchor.id] = this._getScrollPosition(anchor);
      }
      this._anchorPositions = _anchorPositions;
    }

    let currentSection;
    for (const id in _anchorPositions) {
      if (_anchorPositions[id] <= top) {
        currentSection = id;
      } else {
        break;
      }
    }

    if (currentSection !== this._currentSection) {
      this._currentSection = currentSection;
      // update query string in url
      this.props.updateQueryString(currentSection ? `?section=${currentSection}` : '');
    }
  }

  render() {
    const {html} = this.state;

    /* eslint-disable react/no-danger */
    return (
      <div className="markdown" ref="container" onScroll={this._onScroll.bind(this)}>
        {html.split(INJECTION_REG).map((__html, index) => {
          if (!__html) {
            return null;
          }
          return <div key={index} className="markdown-body" dangerouslySetInnerHTML={{__html}} />;
        })}
      </div>
    );
    /* eslint-enable react/no-danger */
  }
}

MarkdownPage.propTypes = {
  content: PropTypes.string
};

MarkdownPage.defaultProps = {
  content: ''
};
