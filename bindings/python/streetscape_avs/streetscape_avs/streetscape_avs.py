import ipywidgets as widgets
from traitlets import Unicode, List, Int, validate, TraitError

@widgets.register
class Streetscape(widgets.DOMWidget):
    """A Streetscape.gl widget."""
    _view_name = Unicode('StreetscapeGLView').tag(sync=True)
    _model_name = Unicode('StreetscapeGLModel').tag(sync=True)
    _view_module = Unicode('@streetscape/jupyter-widget').tag(sync=True)
    _model_module = Unicode('@streetscape/jupyter-widget').tag(sync=True)
    _view_module_version = Unicode('^0.1.0').tag(sync=True)
    _model_module_version = Unicode('^0.1.0').tag(sync=True)

    log = Unicode('default').tag(sync=True)
    port = Int(3000).tag(sync=True)
    mapboxAccessToken = Unicode('').tag(sync=True)
