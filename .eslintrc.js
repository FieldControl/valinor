const { off } = require("process");

module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:react/recommended', 'airbnb', 'plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint', 'plugin:prettier/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'prettier'],
  rules: {
    'linebreak-style': 0,
    'react/prop-types': 0,
    'react/jsx-filename-extension': 0,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    "react/require-default-props": 0,
    "no-unused-vars": 0,
    "@typescript-eslint/no-unused-vars": "error",
    camelcase: 0,
    'prettier/prettier': 0,
    'no-use-before-define': 0,
    'import/prefer-default-export': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
  },
};
