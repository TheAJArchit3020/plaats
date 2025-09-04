const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      'react-native-reanimated': require.resolve('react-native-reanimated'),
    },
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'mjs'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
