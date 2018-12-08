import AVS_DOCS from '../../avs-pages.json';
import XVIZ_DOCS from '../../../../xviz/website/pages.json';
import STREETSCAPE_DOCS from '../../pages.json';

// TODO: replace with github url when the repo is public
function getAVSDocUrl(filename) {
  return `/streetscape-docs/${filename}`;
}
function getXVIZDocUrl(filename) {
  return `/xviz-docs/${filename}`;
}
function getStreetscapeDocUrl(filename) {
  return `/streetscape-docs/${filename}`;
}

// mapping from file path in source to generated page url
export const markdownFiles = {};

function generatePath(cachKey, tree, getDocUrl, parentPath = '', depth = 0) {
  if (Array.isArray(tree)) {
    tree.forEach(branch => generatePath(cachKey, branch, getDocUrl, parentPath, depth));
    return tree;
  }

  tree.depth = depth;
  if (tree.name) {
    tree.path = tree.name
      .match(/(GeoJson|3D|API|JSON|XVIZ|UI|FAQ|[A-Z]?[a-z'0-9\.]+|\d+)/g)
      .join('-')
      .toLowerCase()
      .replace(/[^\w-]/g, '');
  }
  if (tree.children) {
    generatePath(cachKey, tree.children, getDocUrl, `${parentPath}/${tree.path}`, depth + 1);
  }
  if (typeof tree.markdown === 'string') {
    tree.markdown = getDocUrl(tree.markdown);
    const i = tree.markdown.indexOf('docs/');
    if (i >= 0) {
      markdownFiles[tree.markdown.slice(i)] = `${cachKey}${parentPath}/${tree.path}`;
    }
  }

  return tree;
}

export const avsDocPages = generatePath('avs', AVS_DOCS, getAVSDocUrl);

export const streetscapeDocPages = generatePath(
  'streetscape.gl',
  STREETSCAPE_DOCS,
  getStreetscapeDocUrl
);

export const xvizDocPages = generatePath('xviz', XVIZ_DOCS, getXVIZDocUrl);
