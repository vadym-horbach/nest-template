module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: { es6: true, node: true, jest: true },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    /* variables */
    '@typescript-eslint/no-use-before-define': ['error', { ignoreTypeReferences: true }],
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-shadow': ['error', { ignoreTypeValueShadow: true }],
    '@typescript-eslint/promise-function-async': 'warn',
    '@typescript-eslint/no-misused-promises': ['warn', { checksVoidReturn: { arguments: false } }],
    '@typescript-eslint/no-floating-promises': ['warn', { ignoreVoid: true }],
    'no-void': ['error', { allowAsStatement: true }],
    'class-methods-use-this': ['off'],
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['^ipm'] }],
    'func-names': ['error', 'never'],
    /* comparison operators */
    'no-nested-ternary': 'warn',
    'no-mixed-operators': 'warn',
    /* blocks */
    'default-case': ['error', { commentPattern: '^no-default$' }],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: 'directive', next: '*' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'never', prev: ['case'], next: 'block-like' },
      { blankLine: 'never', prev: 'block-like', next: ['case', 'default'] },
    ],
    /* class */
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],
    'max-classes-per-file': 'off',
    /* export/import */
    'import/prefer-default-export': 'off',
    /* types */
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': ['warn'],
    '@typescript-eslint/no-inferrable-types': ['off'],
    /* naming  */
    '@typescript-eslint/naming-convention': [
      'warn',
      { selector: 'interface', format: ['PascalCase'], prefix: ['I_'] },
      { selector: 'typeAlias', format: ['PascalCase'], prefix: ['T_'] },
      { selector: 'enum', format: ['PascalCase'], suffix: ['Enum'] },
    ],
    '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
}
