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
  },
}; 