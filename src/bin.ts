#! /usr/bin/env node

import type { ConfigArray } from './types/config';
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { config, runTask, waitForArgs } from './util';
import * as schedule from 'node-schedule';
import { isBiliCookie } from './utils/cookie';
import { scanLogin } from './utils/login';
import { program } from 'commander';
import fg from 'fast-glob';

process.env.IS_LOCAL = 'true';

(async () => {
  program
    .version(
      `BiliOutils v${getPkg().version}\nnode ${process.version}\nplatform ${process.platform} ${
        process.arch
      }`,
      '-v, --version',
      '输出版本号',
    )
    .helpOption('-h, --help', '输出帮助信息')
    .description('BiliOutils 哔哩哔哩自动化工具箱')
    .option('-c, --config <path>', '配置文件路径')
    .option('-ld, --log-dir <path>', '日志文件目录')
    .option(
      '-i, --item <item>',
      '多用户配置执行指定的配置，下标 1 开始（倒数 -1 开始），使用英文逗号（,）分隔',
    )
    .option('-cck, --createCookie <path>', '输出新的 cookie 到控制台')
    .option('-o, --once', '每日任务只执行一次', false)
    .option('-t, --task <task>', '执行指定的 task，使用英文逗号（,）分隔')
    .option('--cron <cron>', 'cron 表达式')
    .option(
      '--delay <time1[-time2]>',
      '不带单位是延迟 time 分钟后执行，单位可以为 ms（毫秒）、s（秒）、m（分）、h（小时）',
    )
    .option('-l, --login', '扫码登录，可以配合 --config 使用')
    .option('--detached', '子进程独立运行，不受父进程影响，windows 下无日志打印到控制台', false)
    .option('--async', '异步执行，多个账号同时运行', false)
    .parse(process.argv);

  const opts = program.opts<{
    config?: string;
    logDir?: string;
    item?: string;
    createCookie?: string;
    once?: boolean;
    task?: string;
    cron?: string;
    delay?: string;
    login?: boolean;
    detached?: boolean;
    async?: boolean;
  }>();

  if (opts.logDir) {
    process.env.BILIOUTILS_LOG_DIR = opts.logDir;
  }

  if (opts.detached) {
    process.env.BILIOUTILS_DETACHED = 'true';
  }

  if (opts.async) {
    process.env.BILIOUTILS_ASYNC = 'true';
  }

  if (opts.login) {
    if (opts.config) {
      return await scanLogin(resolve(process.cwd(), opts.config));
    }
    return await scanLogin();
  }
  if (opts.createCookie) {
    return await createCookie(opts.createCookie);
  }
  if (opts.config) {
    return await run(opts.config);
  }
})();

/**
 * 记住本次运行情况
 */
async function remember(jobsPath: string) {
  const { writeJsonFile } = await import('@/utils/file');
  // 写进 config 同级 bt_jobs.json
  writeJsonFile(jobsPath, {
    lastRun: new Date().getTime(),
  });
}

/**
 * 判断今日是否已经运行过
 */
async function isTodayRun(jobsPath: string) {
  if (!program.opts().once) {
    return;
  }
  // 判断文件是否存在
  if (!existsSync(jobsPath)) return;
  // 读取配置文件同路径 bt_jobs.json
  const jobsObj = JSON.parse(readFileSync(jobsPath, 'utf-8'));
  if (jobsObj.lastRun) {
    // lastRun 是否是今天
    const lastRun = new Date(jobsObj.lastRun);
    const today = new Date();
    const { defLogger } = await import('./utils/log/def');
    if (
      lastRun.getFullYear() === today.getFullYear() &&
      lastRun.getMonth() === today.getMonth() &&
      lastRun.getDate() === today.getDate()
    ) {
      defLogger.info('今日已经运行过');
      return true;
    }
  }
}

async function run(configPath: string) {
  const configDir = dirname(resolve(process.cwd(), configPath));
  const jobsPath = resolve(configDir, 'bt_jobs.json');
  const configPaths = fg.sync(resolve(process.cwd(), configPath));
  const configs = (await Promise.all(configPaths.map(async file => await config(file))))
    .flat()
    .filter(Boolean);
  if (!configs) {
    return;
  }
  const { cron } = program.opts();

  if (cron) {
    process.stdout.write(`等待运行：cron ${cron}\n`);
    schedule.scheduleJob(
      'tasks',
      {
        rule: cron,
        tz: 'Asia/Shanghai',
      },
      async () => {
        await waitForArgs();
        await argTaskHandle(jobsPath, configs);
      },
    );
    return;
  }

  await waitForArgs();
  return await argTaskHandle(jobsPath, configs);
}

async function argTaskHandle(jobsPath: string, configs: ConfigArray) {
  const { task } = program.opts();
  if (task) {
    return await runTask(configs, './bin/inputTask', task);
  }
  if (await isTodayRun(jobsPath)) return;
  await runTask(configs);
  await remember(jobsPath);
}

async function createCookie(cookiePath: string) {
  // 获取 old cookie 路径或者内容
  const oldCookie = cookiePath;
  if (!oldCookie) {
    process.stdout.write('请输入 cookie\n');
    return;
  }
  const { getNewCookie } = await import('./service/auth.service');
  // 如果 old cookie 是 cookie 字符串
  if (isBiliCookie(oldCookie)) {
    const cookie = await getNewCookie(oldCookie);
    printCookie(cookie);
    return;
  }
  // 如果 old cookie 是 cookie 文件路径
  const resolvedCookiePath = resolve(process.cwd(), oldCookie);
  if (!existsSync(resolvedCookiePath)) {
    process.stdout.write('cookie 文件不存在\n');
  }
  const cookie = readFileSync(resolvedCookiePath, 'utf-8');
  if (!isBiliCookie(cookie)) {
    process.stdout.write('cookie 文件不是 cookie\n');
    return;
  }
  const newCookie = await getNewCookie(cookie);
  printCookie(newCookie);

  function printCookie(cookie: string | undefined) {
    if (cookie) {
      process.stdout.write(cookie + '\n\n');
    } else {
      process.stdout.write('获取 cookie 失败\n');
    }
  }
}

function getPkg() {
  try {
    try {
      return require(resolve(__dirname, '../package.json'));
    } catch {
      return require(resolve(__dirname, './package.json'));
    }
  } catch {
    return {};
  }
}
