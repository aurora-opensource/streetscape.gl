/**
 * Deep merges two XVIZ style objects.
 * The primary style stream rules will take precedence over the secondary rules.
 *
 * @param style1 {object} Secondary stylesheet
 * @param style2 {object} Primary stylesheet
 * @returns {object} Merged styleheet with Primary rules taking precedence
 */
export function mergeXVIZStyles(style1, style2) {
  if (!style1) {
    return style2 || {};
  }
  if (!style2) {
    return style1;
  }

  const mergedStyles = {...style1};

  for (const streamName in style2) {
    if (mergedStyles[streamName]) {
      const rules1 = style1[streamName];
      const rules2 = style2[streamName];
      mergedStyles[streamName] = rules1.concat(rules2);
    } else {
      mergedStyles[streamName] = style2[streamName];
    }
  }
  return mergedStyles;
}
