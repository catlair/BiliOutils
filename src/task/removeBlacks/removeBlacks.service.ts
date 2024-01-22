import { modeRelation } from '@/net/user-info.request';
import { getBlacksApi } from './removeBlacks.request';
import { logger, sleep } from '@/utils';

async function getBlackPage(pageNum: number) {
  try {
    const { code, message, data } = await getBlacksApi(pageNum);
    if (code !== 0) {
      logger.fatal(`获取黑名单 pn=${pageNum}`, code, message);
      return;
    }
    return data;
  } catch (err) {
    logger.exception(`获取黑名单 pn=${pageNum}`, err);
  }
}

async function getBlacks() {
  let pageNum = 1;
  const resp = await getBlackPage(pageNum);
  if (!resp) return [];
  const totalPageNum = Math.ceil(resp.total / 20);
  const blacks = resp.list;
  for (; pageNum <= totalPageNum; pageNum++) {
    await sleep(1000);
    const { list } = (await getBlackPage(pageNum)) || {};
    if (list) blacks.push(...list);
  }
  return blacks;
}

async function removeBlacks(mid: number) {
  try {
    const { code, message } = await modeRelation(mid, 6);
    if (code !== 0) {
      return logger.fatal(`取消黑名单 ${mid}`, code, message);
    }
  } catch (error) {
    logger.exception(`取消黑名单 ${mid}`, error);
  }
}

export async function removeBlacksService() {
  logger.debug(`获取黑名单`);
  const blacks = await getBlacks();
  logger.debug(`获取黑名单完成`);
  if (!blacks.length) return logger.debug(`无需操作`);
  const rmBlacks = blacks.filter(({ uname }) => uname === '账号已注销');

  logger.debug(`需要清理数量： ${rmBlacks.length}`);

  for await (const { mid } of rmBlacks) {
    logger.debug(`clean ${mid}`);
    await removeBlacks(mid);
    await sleep(1000, 4000);
  }
}
