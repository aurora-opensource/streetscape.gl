# To release a new version of streetscape_avs on PyPI:

Update _version.py (set release version, remove 'dev')
git add the _version.py file and git commit
`python setup.py sdist upload`
`python setup.py bdist_wheel upload`
`git tag -a X.X.X -m 'comment'`
Update _version.py (add 'dev' and increment minor)
git add and git commit
git push
git push --tags

- To release a new version of @streetscape/jupyter-widget on NPM:

```
# clean out the `dist` and `node_modules` directories
git clean -fdx
npm install
npm publish
```


# clean out dist
rm dist/*

# build widget (is this necessary?)
cd js, yarn build
verify dist/index.js
j
# build (dev pyenv) for this
python setup.py sdist bdist_wheel

# test (separate pyenv for this)
twine upload --repository-url https://test.pypi.org/legacy/ dist/*
python3 -m pip uninstall xviz_avs
python3 -m pip install -i https://test.pypi.org xviz_avs
python3 -m pip install -i https://test.pypi.org/legacy xviz_avs
python3 -m pip install -i https://test.pypi.org/simple/ "xviz-avs=0.1.0a3"
python3 test-xviz.py

# upload
twine upload dist/*
