export default [
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-eval': 'error'
    }
  }
];
