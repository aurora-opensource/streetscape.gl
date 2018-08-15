module.exports = function babelConfig(api) {
  api.cache(() => process.env.NODE_ENV === 'production'); // eslint-disable-line

  return {
    presets: ['@babel/preset-env'],
    plugins: [
      [
        'babel-plugin-module-resolver',
        {
          root: ['./src'],
          alias: {
            '~': './src'
          }
        }
      ],
      [
        '@babel/plugin-proposal-class-properties', {loose: false}
      ]
    ]
  };
};
