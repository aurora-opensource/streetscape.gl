module.exports = function babelConfig(api) {
  api.cache(() => process.env.NODE_ENV === 'production'); // eslint-disable-line

  return {
    presets: ['@babel/preset-env'],
    plugins: [
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      '@babel/plugin-proposal-function-sent',
      '@babel/plugin-proposal-function-bind',
      '@babel/plugin-proposal-do-expressions',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-logical-assignment-operators',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-throw-expressions',

      // Stage 3
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      ['@babel/plugin-proposal-class-properties', {loose: false}],
      '@babel/plugin-proposal-json-strings'
    ]
  };
};
