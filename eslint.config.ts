import js from '@eslint/js';
import json from '@eslint/json';
import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['**.sdPlugin/**', 'docs/**']),
  // 全ファイルを対象とする基本設定（型チェック・スタイル含む）
  {
    files: ['**/*.{js,mjs,ts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      stylistic.configs.customize({
        arrowParens: true,
        quotes: 'single',
        semi: true,
        severity: 'warn',
        braceStyle: '1tbs',
      }),
    ],
    plugins: {
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

      // interface ではなく type を使用する。
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // テンプレートリテラルの埋め込みできる型を制限する。
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // 未使用のimportおよび変数を unused-imports プラグインで一元管理する。
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
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
      },
    },
  },
  // tsconfig の対象外となる設定ファイル群の型チェックを無効化
  {
    files: ['eslint.config.ts', 'rollup.config.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // Property Inspector UI コンポーネント向けのブラウザ環境設定
  {
    files: ['src/ui/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
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
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.json5'],
    plugins: { json },
    language: 'json/json5',
    extends: ['json/recommended'],
  },
]);
