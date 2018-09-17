// Deep merges two XVIZ style objects
export function mergeXvizStyles(style1, style2) {
  if (!style1) {
    return style2 || {};
  }
  if (!style2) {
    return style1;
  }

  const mergedStyles = {...style1};

  for (const streamName in style2) {
    if (mergedStyles[streamName]) {
      const rules1 = normalizeXvizStyleRules(style1[streamName]);
      const rules2 = normalizeXvizStyleRules(style2[streamName]);
      mergedStyles[streamName] = rules1.concat(rules2);
    } else {
      mergedStyles[streamName] = style2[streamName];
    }
  }
  return mergedStyles;
}

function normalizeXvizStyleRules(rules) {
  return Array.isArray(rules)
    ? rules
    : // Backward compatibility - support classname to style map
      Object.keys(rules).map(classname => ({...rules[classname], class: classname}));
}
