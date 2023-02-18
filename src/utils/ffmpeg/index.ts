import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

function createFFmpge(input: string, output: string) {
  return spawn(
    'ffmpeg',
    [
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
    ],
    {
      windowsHide: true,
    },
  );
}

/**
 * 监听推流
 */
async function listenPushStream(ffmpeg: ChildProcessWithoutNullStreams) {
  const { logger } = await import('../log');

  return new Promise<number>((resolve, reject) => {
    const logs: string[] = [];
    ffmpeg.on('close', code => {
      logger.debug(`child process exited with code ${code}`);
      if (code === 255) {
        return resolve(255);
      }
      // 如果最新的 10 条日志中包含 End of file，则认为推流成功
      if (logs.some(log => log.includes('End of file'))) {
        return resolve(0);
      }
      if (code !== 0) {
        return reject(code);
      }
      resolve(0);
    });

    // 正常日志输出在 stderr 中？why？
    ffmpeg.stderr.on('data', data => {
      const log = data.toString();
      logs.push(log);
      if (logs.length > 10) logs.shift();
      logger.debug(`ffmpeg out: ${log}`);
    });
    ffmpeg.stderr.on('error', data => logger.debug(`ffmpeg err: ${data}`));
  });
}

export async function pushToStream(inputs: string[], output: string, stopRef: Ref<boolean>) {
  const { logger } = await import('../log');

  // 循环推流，直到 timeout
  while (!stopRef.value) {
    const code = await push();
    if (code !== 0) return code;
  }
  return 0;

  async function push() {
    let code = 0;
    for (const input of inputs) {
      logger.debug(`推流视频：【${input}】`);
      const ffmpeg = createFFmpge(input, output);
      const timer = setInterval(() => {
        if (stopRef.value) {
          ffmpeg.kill();
          logger.info(`推流时间达到，结束推流`);
        }
      }, 5000);
      try {
        code = await listenPushStream(ffmpeg);
      } catch (error) {
        logger.error(`推流异常：`, error);
      } finally {
        clearInterval(timer);
      }
    }
    return code;
  }
}
