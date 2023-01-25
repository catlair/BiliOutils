import path from 'path';

export function resolvePwd(str: string) {
  return path.resolve(process.cwd(), str);
}

export function resolvePwdArray(arr: string[]) {
  return arr.map(resolvePwd);
}
