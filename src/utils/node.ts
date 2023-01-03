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
