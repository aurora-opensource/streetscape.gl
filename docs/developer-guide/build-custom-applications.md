# Building Custom Applications

Use the UI components in streetscape.gl as a toolkit for quickly building your own custom
visualization applications.

streetscape.gl builds on reusable React components from the
[monochrome](https://github.com/uber-web/monochrome) toolkit.

## The 3D World View

The 3D world view can be included as a component in a bigger application through the instantiation
of a single React component.

```jsx
<LogViewer log={log} viewMode={VIEW_MODE.TOP_DOWN} />
```
