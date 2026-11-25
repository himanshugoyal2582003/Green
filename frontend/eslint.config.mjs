/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['error'] }],
    },
  },
];
