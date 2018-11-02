Landing page for Streetscape.gl


## Development

### Streetscape styles

#### How to use

1. Include the css and font loader in webpack config.


Check `examples/website-demo/webpack.config.js`. 

```js
// for css
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              includePaths: ['website/styles']
            }
          },
          ...
        ]
      }
      
// for fonts      
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              includePaths: ['website/assets']
          }
          },
          ...
        ]
      }
```

2. Access the icon by classname, check `styles/style.css` for supported icons.

```js
// react jsx
<span className="icon-video"/>
```

#### How to update

- Go to [icomoon](https://icomoon.io/app/#/projects) projects page
- Click `Import Project`, upload `styles/Streetscappe.json` file, then load the project
- Could import more icons, then select the icons and click `Generate Font` at the bottom.
- Download the generated files and update `assets/` and `styles/` with associate ones.
