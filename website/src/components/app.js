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
import styled from 'styled-components';
import {connect} from 'react-redux';
import {Switch, Route, Redirect} from 'react-router';

import Header from './header';
import Home from './home';
import Gallery from './gallery';
import MarkdownPage from './markdown-page';

import {aboutPage, xvizDocPages, streetscapeDocPages} from '../contents/pages';

const GlobalStyleDiv = styled.div`
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;
  padding-top: 64px;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
  }
`;

class App extends Component {
  render() {
    return (
      <GlobalStyleDiv className="sg-web-content">
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/about">{props => <MarkdownPage {...props} page={aboutPage} />}</Route>
          <Route path="/xviz">{props => <Gallery {...props} pages={xvizDocPages} />}</Route>
          <Route path="/streetscape.gl">
            {props => <Gallery {...props} pages={streetscapeDocPages} />}
          </Route>
          <Redirect to="/" />
        </Switch>
      </GlobalStyleDiv>
    );
  }
}

export default connect(state => state)(App);
