// @ts-nocheck
import { declare } from '@babel/helper-plugin-utils';

/**
 * @description remove the `node:` prefix from the node core module, used for node 16 or later or 14.18
 */
export default declare(() => {
  return {
    name: 'unprefix-core-modules',
    visitor: {
      CallExpression(path) {
        const { node } = path;
        if (node.callee.name !== 'require') return;
        const { value = '' } = node.arguments[0];
        if (value.startsWith('node:')) {
          node.arguments[0].value = value.replace(/^node:/, '');
        }
      },
    },
  };
});
