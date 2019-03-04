const path = require('path');
const fs = require('fs');

import test from 'tape-catch';

const ROOT = path.resolve(__dirname, '..');

test('website#all-pages-present', t => {
  visitPagesPaths((relativePath, fullPath) => {
    t.ok(fs.existsSync(fullPath), `Doc page exists: ${relativePath}`);
  });

  t.end();
});

test('website#all-links-valid', t => {
  let linkCount = 0;
  visitPagesPaths((relativePath, fullPath) => {
    visitDocLinks(fullPath, (filePath, lineNumber, link) => {
      linkCount++;
      if (link.startsWith('docs')) {
        t.fail(`Error ${filePath}:${lineNumber}: link cannot start with docs`);
      } else if (link.startsWith('/docs')) {
        const linkFilePath = path.join(ROOT, link);
        if (!fs.existsSync(linkFilePath)) {
          t.fail(`Doc link to valid: ${linkFilePath}`);
        }
      }
    });
  });

  t.ok(linkCount > 10, 'Found some doc links, and they are valid');

  t.end();
});

function loadJSONSync(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// Run the callback documentation files in pages.json
function visitPagesPaths(callback) {
  const visit = input => {
    input.forEach(item => {
      if (item.markdown) {
        const fullPath = path.join(ROOT, 'docs', item.markdown);
        callback(item.markdown, fullPath); // eslint-disable-line callback-return
      } else {
        visit(item.children);
      }
    });
  };

  const pages = loadJSONSync(path.join(ROOT, 'website', 'pages.json'));

  visit(pages);
}

// Run the callback on all markdown links in the given file.
//
// This parses out all [.*](.*) patterns from a markdown file
// in the future we should use a markdown parse to be more robust
// and accurate.
function visitDocLinks(filePath, callback) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let lineNumber = 1;
  lines.forEach(line => {
    const parts = line.split('](');

    if (parts.length >= 2) {
      parts.forEach(part => {
        const sections = part.split(')');
        if (sections.length >= 2) {
          callback(filePath, lineNumber, sections[0]); // eslint-disable-line callback-return
        }
      });
    }
    lineNumber++;
  });
}
