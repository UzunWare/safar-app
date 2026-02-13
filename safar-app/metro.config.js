// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname);

// Resolve @sentry/react-native to local shim until the package is installed
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@sentry/react-native': path.resolve(__dirname, 'lib/utils/sentry.ts'),
};

module.exports = withNativeWind(config, { input: './global.css' });
