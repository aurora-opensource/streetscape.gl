Landing page for Streetscape.gl


## Development

### Streetscape styles

#### How to use

1. Include the css and font loader in webpack config.

Check `examples/website-demo/webpack.config.js`. 

```js
  devServer: {
    contentBase: [
      resolve(__dirname, '../../../data/generated'),
      resolve(__dirname, '../../../website'), // path to website dir
      resolve(__dirname)
    ]
  }
```

2. Add the style file in `index.html`

```js
  <head>
    ...
    <link rel="stylesheet" href="styles/style.css">
  </head>
```

3. Access the icon by classname, check `styles/style.css` for supported icons.

```js
// react jsx
<span className="icon-video"/>
```

#### How to update

- Go to [icomoon](https://icomoon.io/app/#/projects) projects page
- Click `Import Project`, upload `styles/Streetscappe.json` file, then load the project
- Could import more icons, then select the icons and click `Generate Font` at the bottom.
- Download the generated files and update `assets/` and `styles/` with associate ones.
