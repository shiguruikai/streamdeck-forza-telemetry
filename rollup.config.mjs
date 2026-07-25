import path from 'node:path';
import url from 'node:url';

import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = 'com.github.shiguruikai.streamdeck-forza-telemetry.sdPlugin';

/**
 * プラグインバックエンドのビルド設定
 * @type {import('rollup').RollupOptions}
 */
const pluginConfig = {
  input: 'src/plugin.ts',
  output: {
    file: `${sdPlugin}/bin/plugin.js`,
    sourcemap: isWatching,
    sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
      return url.pathToFileURL(path.resolve(path.dirname(sourcemapPath), relativeSourcePath)).href;
    },
  },
  plugins: [
    {
      name: 'watch-externals',
      buildStart() {
        this.addWatchFile(`${sdPlugin}/manifest.json`);
      },
    },
    typescript({
      tsconfig: 'src/tsconfig.json',
      mapRoot: isWatching ? './' : undefined,
    }),
    nodeResolve({
      browser: false,
      exportConditions: ['node'],
      preferBuiltins: true,
    }),
    commonjs(),
    !isWatching && terser(),
    {
      name: 'emit-module-package-file',
      generateBundle() {
        this.emitFile({ fileName: 'package.json', source: '{ "type": "module" }', type: 'asset' });
      },
    },
  ],
};

/**
 * Property Inspector UI Web Component のビルド設定
 * @type {import('rollup').RollupOptions}
 */
const uiConfig = {
  input: 'src/ui/components/global-settings.ts',
  output: {
    file: `${sdPlugin}/ui/components/global-settings.js`,
    format: 'iife',
    sourcemap: isWatching,
  },
  plugins: [
    typescript({
      tsconfig: 'src/ui/tsconfig.json',
      mapRoot: isWatching ? './' : undefined,
    }),
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    !isWatching && terser(),
  ],
};

export default [pluginConfig, uiConfig];
