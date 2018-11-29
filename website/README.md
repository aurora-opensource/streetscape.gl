Landing page for Streetscape.gl

## Start website app

```bash
# install dependencies
cd website
yarn

# buid and start website app
yarn build
# export MpaboxAccessToken if needed
yarn start-local
```

## Development

### streetscape styles

#### How to update

- Go to [icomoon](https://icomoon.io/app/#/projects) projects page
- Click `Import Project`, upload `./Streetscappe.json` file, then load the project
- Could import more icons, then select the icons and click `Generate Font` at the bottom.
- Download the generated files and update with `fonts/` and `style.css` in `assets/`.
