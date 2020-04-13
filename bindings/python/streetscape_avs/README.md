streetscape_avs
===============

A Jupyter widget using streetscape.gl to view XVIZ data.

Installation
------------

To install use pip:

    $ pip install streetscape_avs
    $ jupyter nbextension enable --py --sys-prefix streetscape_avs

For a development installation (requires npm),

    $ git clone https://github.com/uber/streetscape.gl.git
    $ cd streetscape.gl/bindings/python/streetscape_avs
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix streetscape_avs
    $ jupyter nbextension enable --py --sys-prefix streetscape_avs

For jupyter lab development,

    $ jupyter labextension install @jupyter-widgets/jupyterlab-manager --no-build
    $ jupyter labextension install js

When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This take a minute or so to get started, but then allows you to hot-reload your javascript extension.
To see a change, save your javascript, watch the terminal for an update.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter Lab to open.

Development
-----------

Useful commands to remove the modules

    $ jupyter nbextension disable streetscape_avs --py --sys-prefix
    $ jupyter nbextension uninstall --py  --sys-prefix streetscape_avs
    $ pip uninstall streetscape_avs

For Jupyter Lab

    $ jupyter labextension disable @streetscape/jupyter-widget
    $ jupyter labextension uninstall @streetscape/jupyter-widget
    $ jupyter lab clean && jupyter lab build
