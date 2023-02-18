import { biliTasks } from '@/task';
import { TaskConfig } from './index';

function funHandle() {
  return TaskConfig.function;
}

/**
 * 按照配置清空函数
 */
export function getWaitRuningFunc() {
  // 这是使用了黑魔法，也是迫不得已
  // rollup 压缩代码后可能导致变量名变化，就找不到相应函数的，所以才改用下标的方式记录
  const functionConfig = funHandle();
  const result: Array<() => Promise<any>> = [];
  biliTasks.forEach((task, key) => functionConfig[key] && result.push(task));
  return result.map(async func => (await func()).default);
}
