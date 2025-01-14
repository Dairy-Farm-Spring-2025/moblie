module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@config': './src/config',
          '@common': './src/common',
          '@core': './src/core',
          '@store': './src/core/store',
          '@services': './src/services',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
