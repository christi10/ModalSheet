import js from '@eslint/js';
import reactNative from '@react-native-community/eslint-config';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettierConfig,
  {
    plugins: {
      'react-hooks': reactHooks,
      prettier: prettier,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        __DEV__: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortController: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/jsx-no-bind': [
        2,
        {
          ignoreRefs: true,
        },
      ],
    },
  },
  {
    ignores: [
      '*.test.js',
      '**/e2e/**/*.js',
      '**/commands.ts',
      '**/*.cy.js',
      'node_modules/**',
      'ios/**',
      'android/**',
      '.expo/**',
      'lib/**',
      'dist/**',
      'build/**',
    ],
  },
];