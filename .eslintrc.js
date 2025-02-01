module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@next/next/no-img-element': 'off'
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint']
}
