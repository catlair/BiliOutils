import * as path from 'path';
import * as fs from 'fs';
import { biliHttp } from './http';
import { ENV } from './env';

type VersionInfo = {
  tag_name: string;
  notice: {
    common: string[];
    [key: string]: string[];
  };
};

/**
 * 获取最新版本
 */
async function getLatestVersion() {
  const options = {
    timeout: 10000,
  };
  try {
    return await Promise.any([
      biliHttp.get<VersionInfo>(`https://b.2024666.xyz/api/version?name=${ENV.type}`, options),
    ]);
  } catch {
    return {} as VersionInfo;
  }
}

async function printNotice(notices: VersionInfo['notice']) {
  const { logger } = await import('./log');
  if (notices) {
    notices.common.forEach(notice => logger.verbose(notice));
    notices[ENV.type]?.forEach(notice => logger.verbose(notice));
  }
}

/**
 * 上报环境，用于后续开发重心调整
 */
async function patchEnv(version: string | undefined) {
  biliHttp
    .get(`https://b.2024666.xyz/api/statistics?name=${ENV.type}&version=${version}`, {
      headers: {
        referer: 'https://www.bilibili.com',
      },
    })
    .catch(() => undefined);
}

/**
 * 打印版本
 */
export async function printVersion() {
  const { logger } = await import('./log');
  // fuck you qinglong
  if (process.env.NODE_ENV === 'development' && !process.env.IS_QING_LONG) {
    logger.info(`开发版`);
    return;
  }
  let version = '__BILI_VERSION__';
  // 如果 version 被替换，则直接打印
  if (version.includes('.')) {
    logger.info(`当前版本【__BILI_VERSION__】`);
  } else {
    version = '';
  }
  try {
    // 如果没有获取到版本，则尝试获取
    if (!version) {
      version = 'v' + (getVersionByPkg() || getVersionByFile());
      logger.info(`当前版本【${version}】`);
    }
    patchEnv(version);
    if (!version) {
      return;
    }
    const { tag_name, notice } = await getLatestVersion();
    if (tag_name && checkVersion(version, tag_name)) {
      logger.info(`可更新：最新版本【${tag_name}】`);
    }
    await printNotice(notice);
  } catch {}
}

function getVersionByPkg() {
  try {
    return getPkg().version;
  } catch {}
}

function getVersionByFile() {
  try {
    return fs.readFileSync(path.resolve(__dirname, '../version.txt'), 'utf8').trim();
  } catch {}
}

/**
 * 检查版本是否可更新
 * @param version 当前版本
 * @param latestTag 最新版本
 */
export function checkVersion(version: string, latestTag: string) {
  if (version.startsWith('v')) {
    version = version.substring(1);
  }
  if (latestTag.startsWith('v')) {
    latestTag = latestTag.substring(1);
  }
  if (version === latestTag) {
    return false;
  }
  const versionArr = version.split('.').slice(0, 3),
    latestTagArr = latestTag.split('.').slice(0, 3);
  for (let i = 0; i < versionArr.length; i++) {
    const versionNum = parseInt(versionArr[i]),
      latestTagNum = parseInt(latestTagArr[i]);
    if (isNaN(versionNum) || isNaN(latestTagNum)) {
      return true;
    }
    if (versionNum < latestTagNum) {
      return true;
    }
    if (versionNum > latestTagNum) {
      return false;
    }
  }
  return false;
}

function getPkg() {
  try {
    try {
      return require(path.resolve(__dirname, '../package.json'));
    } catch {
      return require(path.resolve(__dirname, '../../package.json'));
    }
  } catch {
    return {};
  }
}
