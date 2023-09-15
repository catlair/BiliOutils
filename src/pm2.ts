import path from 'node:path';
import pm2 from 'pm2';

const NAME = 'bt_daily';

/**
 * @type {import('pm2').StartOptions}
 */
const options: import('pm2').StartOptions = {
  script: path.resolve(__dirname, './index' + path.extname(__filename)),
  name: NAME,
  cron: process.env.BILITOOLS_CRON || '6 */12 * * *',
  autorestart: false,
};

pm2.connect(true, err => {
  if (err) {
    console.log(err);
    process.exit(2);
  }

  pm2.start(options, err => {
    if (err) {
      console.log(err);
      return pm2.disconnect();
    }

    // 启动后立即停止，确保只在 cron 时间执行
    pm2.stop(NAME, () => pm2.disconnect());
  });
});
