import * as path from 'path';
import * as fs from 'fs';
import { biliHttp } from './http';
import { ENV } from './env';

type VersionInfo = {
  tag_name: string;
};

type Notice = {
  content: string;
  config?: {
    key: string[];
    value: any;
  }[];
  version?: string;
  time: {
    start: string;
    end: string;
  };
};

type NoticeResponse = {
  common: Notice[];
  [key: string]: Notice[];
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

/**
 * 获取公告
 */
async function getNotice() {
  const options = {
    timeout: 10000,
  };
  try {
    return await Promise.any([
      biliHttp.get<NoticeResponse>(`https://b.2024666.xyz/json/notices.json`, options),
    ]);
  } catch {
    return {} as NoticeResponse;
  }
}

async function printNotice(notices: NoticeResponse, runVersion: string) {
  if (!notices) return;
  const { logger } = await import('./log');
  const { TaskConfig } = await import('../config');

  notices.common.forEach(forEachNotice);
  notices[ENV.type]?.forEach(forEachNotice);

  function forEachNotice({ content, config, version, time }: Notice) {
    if (version && !checkVersion(runVersion, version)) {
      return;
    }
    if (time) {
      const { start, end } = time;
      const now = new Date().getTime();
      if (start && now < new Date(start).getTime()) {
        return;
      }
      if (end && now > new Date(end).getTime()) {
        return;
      }
    }
    if (
      !config?.every(({ key, value }) => key.reduce((prev, cur) => prev[cur], TaskConfig) === value)
    ) {
      return;
    }
    logger.verbose(content);
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
    const { tag_name } = await getLatestVersion(),
      notice = await getNotice();
    if (tag_name && checkVersion(version, tag_name)) {
      logger.info(`可更新：最新版本【${tag_name}】`);
    }
    await printNotice(notice, version);
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
