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
          '@model': './src/model',
          '@config': './src/config',
          '@common': './src/common',
          '@types': './src/common/types',
          '@core': './src/core',
          '@store': './src/core/store',
          '@services': './src/services',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
