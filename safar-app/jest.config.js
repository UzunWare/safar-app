/** @type {import('jest').Config} */
const path = require('path');

module.exports = {
  preset: 'jest-expo',
  rootDir: path.resolve(__dirname),
  testEnvironment: '<rootDir>/__tests__/setup/test-environment.js',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@supabase/.*|nativewind|react-native-css-interop|@tanstack/.*|zustand)',
  ],
  setupFiles: ['<rootDir>/__tests__/setup/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@sentry/react-native$': '<rootDir>/__mocks__/@sentry/react-native.js',
    '^lottie-react-native$': '<rootDir>/__mocks__/lottie-react-native.js',
  },
  modulePathIgnorePatterns: ['<rootDir>/_archive/'],
  testPathIgnorePatterns: ['<rootDir>/_archive/', '<rootDir>/node_modules/'],
  testMatch: ['<rootDir>/__tests__/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
