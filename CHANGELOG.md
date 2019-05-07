# Change Log

All notable changes to XVIZ will be documented in this file. This project adheres to
[Semantic Versioning](http://semver.org/spec/v2.0.0.html)

## [1.0.0-beta.10]

- Fix black video image being drawn while image promise is pending (#310)
- New debug panel with XVIZ Parser and Log Viewer stats (#306)
- Fix debug callback of LogViewer (#318)
- Handle new point cloud format (#314)

## [1.0.0-beta.9]

- Fix custom layers under deck.gl v7 (#303)
- simplify get-started app (#304)
- Expose underlying components from the log viewer (#309)

## [1.0.0-beta.7]

- Upgrade deck.gl (#297)

## [1.0.0-beta.6]

- Upgrade to deck.gl 6.4.10 (#300)
- Add URL passing to the XVIZ Loaders (#285)
- Add backing missing error handler \_onWSError (#295)
- flip signs (#290)

## [1.0.0-beta.5]

- Upgrade @xviz/parser to beta.7
- Make the XVIZLoaderInterface propogate seek() to the streamBuffer (#288)

## [1.0.0-beta.4]

- Fix sign layer orientation (#281)
- Fix light settings coordinate system (#272)
- XVIZFileLoader: make sure always batchSize files being fetched (#264)

## [1.0.0-beta.3]

- Export mergeXVIZStyles (#254)
- Simplify XVIZLoaderInterface (#259)
- Improve metrics perf (#263)

## [1.0.0-beta.2]

- Fix SignLayer issue with attributeManager not being defined (#247)
- Add debug callback (#250)
- Add onClick callback (#251)

## [1.0.0-beta.1]

Initial beta release.
