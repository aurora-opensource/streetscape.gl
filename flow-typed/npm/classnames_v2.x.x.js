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
// flow-typed signature: cf86673cc32d185bdab1d2ea90578d37
// flow-typed version: 614bf49aa8/classnames_v2.x.x/flow_>=v0.25.x

type $npm$classnames$Classes =
  | string
  | { [className: string]: * }
  | false
  | void
  | null;

declare module "classnames" {
  declare module.exports: (
    ...classes: Array<$npm$classnames$Classes | $npm$classnames$Classes[]>
  ) => string;
}

declare module "classnames/bind" {
  declare module.exports: $Exports<"classnames">;
}

declare module "classnames/dedupe" {
  declare module.exports: $Exports<"classnames">;
}
