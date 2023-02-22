import { Command } from 'commander';

const program = new Command();

program.name('bilitools').description('cli to some bilibilit utils').version('v0.1.0');

program
  .option('-c, --config', '配置文件路径')
  .option('-cck, --create-cookie', '输出新的 cookie 到控制台')
  .option('-o, --once', '每日任务只执行一次')
  .option('-t, --task', '执行指定的 task，使用英文逗号（,）分隔')
  .option(
    '-i, --item',
    '多用户配置执行指定的配置，下标 1 开始（倒数 -1 开始），使用英文逗号（,）分隔',
  )
  .option('--cron', 'cron 表达式')
  .option(
    '--delay',
    '不带单位是延迟 time 分钟后执行，单位可以为 ms（毫秒）、s（秒）、m（分）、h（小时）',
  )
  .option('-l, --login', '扫码登录，可以配和 --config 使用');
