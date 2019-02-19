# How to update and publish the AVS.auto website

This explains the following:
 - how to build the website
 - how to test the website
 - how to get `website/dist` into the **gh-pages** branch

## Setup

Make sure you have the following setup for streetscape.gl and xviz

```
├── <parent>
│   ├── streetscape.gl
│   ├── xviz
```

## Build and Test

Change to the website directory and build
```
$ cd website
website $ yarn && yarn build
```

You can test the built documentation using any simple HTTP server.
```
website $ cd dist
website\dist $ python -m SimpleHTTPServer 8089
website\dist $ open http://localhost:8089
```

## Commit to **gh-pages** branch

We host the site from the **gh-pages** branch. Because this is sensative only
certain people have push access to this branch.

The **gh-pages** branch has no code and only the website data.  For this reason I
find it easier to use __git worktree__ to have this branch in separate directory tied
to the current repo location.

Assuming you are in the __streetscape.gl__ root directory and the website has
been built.

```
$ git worktree add ../streetscape.gl-gh-pages gh-pages
$ cp -r website/dist/ ../streetscape.gl-gh-pages
$ cd ../streetscape.gl-gh-pages
```

You can verify what files are changing (usually `bundle.js` & `demo/bundle.js`).
You can test using any HTTP Server as before.

```
$ git status
$ python -m SimpleHTTPServer 8089
$ open http://localhost:8089
```

Once validated you can push your changes.

To clean up your worktree do the following.

```
$ cd ../streetscape.gl
$ git worktree remove ../streetscape.gl-gh-pages
```

## Validate Production

Visit https://avs.auto and verify general functionality and any changes.
