import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import packageJSON from '../package.json' assert { type: 'json' };

function getCoreJsVersion() {
  const coreJsVersion = packageJSON.dependencies['core-js'];
  if (!coreJsVersion) {
    throw new Error('core-js version not found');
  }
  return coreJsVersion.match(/\d+\.\d+/)?.[0] || '3';
}

/**
 * 根据版本号确定是否需要转换
 * @param {string} version
 */
function shouldTransform(version) {
  const [major, minor = 0] = version.split('.').map(Number);
  // node 16 以上不需要转换, 14.18 也不需要转换
  return major < 16 && !(major === 14 && minor >= 18);
}

/**
 * @type {import('@babel/core').PluginItem[]}
 */
const plugins = [
  [
    'module-resolver',
    {
      alias: {
        '@': './src',
        '#': './src/types',
        '~': './src/task',
      },
    },
  ],
];

/**
 * @param {{ node?: string; }} [options]
 */
export function baseConfig(options = {}) {
  const { node = '14' } = options;

  if (shouldTransform(node)) {
    // get plugin path ，not use __dirname because it is esm
    plugins.push(
      resolve(dirname(fileURLToPath(import.meta.url)), './babel/unprefix-core-modules.mjs'),
    );
  }

  return {
    presets: [
      [
        '@babel/env',
        {
          useBuiltIns: 'usage',
          corejs: getCoreJsVersion(),
          targets: {
            node,
          },
        },
      ],
      '@babel/preset-typescript',
    ],
    comments: false,
    plugins,
    ignore: ['**/__test__', '**/*.test.ts', '**/*.spec.ts', '**/types', '**/dto'],
  };
}
