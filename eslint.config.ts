import js from '@eslint/js';
import json from '@eslint/json';
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**.sdPlugin/bin/**', '**/sdpi-components.js', 'docs/**']),
  {
    files: ['**/*.{js,ts,mjs}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    plugins: {
      '@stylistic': stylistic,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // 可能な限りシングルクォーテーションを使用する。
      '@stylistic/quotes': ['warn', 'single', { allowTemplateLiterals: 'avoidEscape', avoidEscape: true }],
      // 不要なセミコロンを禁止する。
      '@stylistic/no-extra-semi': 'warn',
      // セミコロンは文末に付ける。
      '@stylistic/semi-style': ['warn', 'last'],
      // anyの使用を許可する。
      '@typescript-eslint/no-explicit-any': 'off',
      // 未使用のimportを禁止する。
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // imports および exports をソートする。
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.jsonc', '**/tsconfig.json', '.vscode/**/*.json'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended']
  },
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },
]);
