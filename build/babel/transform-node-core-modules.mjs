// @ts-nocheck
import { declare } from '@babel/helper-plugin-utils';

/**
 * @description Convert a module name starting with node: to a module name without the node: prefix so that node versions 16 and 14.18 can run properly
 */
export default declare(() => {
  return {
    name: 'transform-node-core-modules',
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
