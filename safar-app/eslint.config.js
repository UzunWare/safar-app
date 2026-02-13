const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['*.config.js', 'metro.config.js', 'jest.config.js', 'babel.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/*', '_archive/**', '.expo/**', 'coverage/**'],
  },
  {
    files: ['__tests__/**/*.{js,jsx,ts,tsx}', '__mocks__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import/first': 'off',
    },
  },
  {
    files: ['supabase/functions/**/*.ts'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);
