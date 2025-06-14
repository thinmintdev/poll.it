module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  plugins: ['react', 'jsx-a11y'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Add other rules as needed based on new ESLint version or project requirements
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect React version
    },
  },
  parserOptions: {
    ecmaVersion: 2021, // or a more recent version like 2022, 2023
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2021: true, // or a more recent version
  },
};