import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

function createFFmpge(input: string, output: string) {
  return spawn('ffmpeg', [
    '-re', // 读取速度
    '-i', // 输入
    input,
    '-vcodec', // 视频编码
    'copy', // 视频编码
    '-acodec', // 音频编码
    'aac', // 音频编码
    '-b:a', // 音频比特率
    '192k', // 音频比特率
    '-f', // 输出格式
    'flv', // 输出格式
    output,
  ]);
}

/**
 * 监听推流
 */
async function listenPushStream(
  ffmpeg: ChildProcessWithoutNullStreams,
  timer?: NodeJS.Timeout | 0,
) {
  const { logger } = await import('../log');

  return new Promise<number>((resolve, reject) => {
    ffmpeg.on('close', code => {
      timer && clearTimeout(timer);
      if (code !== 0) {
        logger.debug(`child process exited with code ${code}`);
        reject(code);
        return;
      }
      resolve(0);
    });

    // 正常日志输出在 stderr 中？why？
    ffmpeg.stderr.on('data', data => logger.debug(`ffmpeg out: ${data}`));
    ffmpeg.stderr.on('error', data => logger.debug(`ffmpeg err: ${data}`));
  });
}

export async function pushToStream(input: string[], output: string, timeout: number) {
  // 计时
  const time = new Date().getTime();
  // 循环推流，直到 timeout
  while (timeout > 0) {
    const code = await push();
    if (code !== 0) return code;
  }
  return 0;

  async function push() {
    for (const item of input) {
      const ffmpeg = createFFmpge(item, output);
      const timer = setTimeout(() => ffmpeg.kill(), timeout);
      try {
        const code = await listenPushStream(ffmpeg, timer);
        if (code !== 0) return code;
        timeout = timeout - (new Date().getTime() - time);
      } catch (error) {
        const { logger } = await import('../log');
        logger.error(`推流异常：`, error);
        return -1;
      }
    }
  }
}

/**
 * 检查命令是否存在
 */
export function hasCmd(command: string, args?: readonly string[]) {
  return new Promise<boolean | number>(resolve => {
    const cmd = spawn(command, args);
    cmd.on('close', code => (code !== 0 ? resolve(code || false) : resolve(true)));
    cmd.on('error', () => resolve(false));
  });
}
