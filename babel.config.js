module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@ar': './src/ar',
          '@screens': './src/screens',
          '@components': './src/components',
          '@data': './src/data',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
