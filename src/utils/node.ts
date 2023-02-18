import { spawn } from 'node:child_process';

/**
 * 检查命令是否存在
 */
export function hasCmd(command: string, args?: readonly string[]) {
  return new Promise<boolean | number>(resolve => {
    const cmd = spawn(command, args, { windowsHide: true });
    cmd.on('close', code => (code !== 0 ? resolve(code || false) : resolve(true)));
    cmd.on('error', () => resolve(false));
  });
}

/**
 * 进程事件开关
 */
export function eventSwitch(event: NodeJS.Signals, listener: (...args: any[]) => void) {
  const on = () => process.on(event, listener);
  const off = () => process.off(event, listener);
  return {
    on: () => {
      on();
      return off;
    },
    off,
  };
}

/**
 * 监听所有进程退出事件
 */
export function onExit(pro: NodeJS.Process, listener: (...args: any[]) => void) {
  const thisListener = () => {
    listener();
    pro.exit();
  };
  const events = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
  events.forEach(event => pro.on(event, thisListener));
  // 返回取消监听函数
  return () => {
    events.forEach(event => pro.off(event, thisListener));
  };
}
