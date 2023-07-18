/**
 * 写入 stdout
 */
export function writeOut(message: string) {
  process.stdout.write(message);
}

/**
 * 写入 stderr
 */
export function writeError(message: string) {
  // 很多平台 不支持输出 stderr 所以放弃
  process.stdout.write(message);
}
