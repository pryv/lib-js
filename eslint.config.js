/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/**
 * ESLint flat config using neostandard (modern successor to semistandard)
 * Style: StandardJS with semicolons + TypeScript checks
 */
const neostandard = require('neostandard');
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'test-browser/**',
      'components/*/examples/pryv-*.js'
    ]
  },

  // Neostandard with semicolons (semistandard style)
  ...neostandard({ semi: true, noStyle: false }),

  // TypeScript support
  ...tseslint.configs.recommended,

  // Main configuration
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.mocha,
        fetch: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly'
      }
    },
    rules: {
      // TypeScript adjustments
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'none',
        caughtErrors: 'none',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  },

  // TypeScript declaration files - relaxed rules
  {
    files: ['**/*.d.ts'],
    rules: {
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/no-multiple-empty-lines': 'off',
      '@stylistic/eol-last': 'off',
      '@stylistic/no-multi-spaces': 'off',
      '@stylistic/no-trailing-spaces': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off'
    }
  },

  // Test files - relaxed rules
  {
    files: ['**/test/**/*.js', '**/*.test.js', '**/*.spec.js'],
    rules: {
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
];
