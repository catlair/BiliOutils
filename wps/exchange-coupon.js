const random = (a, b) => Math.floor(Math.random() * b + a)
const getCookieItem = (cookie, key) => {
  if (!cookie) return null;
  const reg = `(?:^| )${key}=([^;]*)(?:;|$)`;
  const r = cookie.match(reg);
  return r ? r[1] : null;
}

const mangaPointUrl = 'https://manga.bilibili.com/twirp/pointshop.v1.Pointshop/GetUserPoint',
  exchangeMangaShopUrl = 'https://manga.bilibili.com/twirp/pointshop.v1.Pointshop/Exchange'

const exchangeTimeMap = {
  0: {
    id: 1938,
    cost: 100,
  },
  10: {
    id: 1939,
    cost: 300,
  },
  12: {
    id: 1940,
    cost: 500,
  },
}

function run(row) {
  const getValue = (str) => Application.Range(str + row).Text
  const cookie = getValue("A"),
    userAgent = getValue("B") || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    exchangeCouponNum = Number(getValue("C")) || 10,
    keepAmount = Number(getValue("D")) || 0,
    exchangeTime = Number(getValue("E")) || 12

  const request = (path, options = {}) => {
    return HTTP.fetch(path, {
      timeout: 5000,
      method: 'POST',
      headers: {
        'user-agent': userAgent,
        cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'accept-language': 'zh-CN,zh;q=0.9',
        'accept-encoding': 'gzip, deflate, br',
        accept: '*/*',
      },
      ...options,
    })
  }

  const mangaPointApi = () => request(mangaPointUrl),
    exchangeMangaShopApi = (product_id = 1938, point = 100, product_num = 1) => request(exchangeMangaShopUrl, { body: `product_id=${product_id}&point=${point}&product_num=${product_num}` })

  function getMangaPoint() {
    try {
      const { data, code, msg } = mangaPointApi().json()
      if (code !== 0) {
        console.error(code)
        console.error(msg)
        return 0
      }
      return parseInt(data.point, 10) || 0
    } catch (error) {
      console.log('获取积分出现异常')
      console.error(error.message)
    }
    return 0
  }

  function getExchangeNum() {
    const point = getMangaPoint()
    console.log(`当前积分${point}`)
    if (point <= keepAmount) {
      console.log(`积分不足，需保留，跳过任务`)
      return 0
    }
    const buyCouponNum = Math.floor((point - keepAmount) / exchangeTimeMap[exchangeTime].cost)
    if (buyCouponNum < 1) {
      console.log('可兑换的漫读券数量不足 1，跳过任务')
      return 0
    }
    return exchangeCouponNum < 1 ? buyCouponNum : Math.min(buyCouponNum, exchangeCouponNum)
  }


  function exchange(num) {
    try {
      const { id, cost } = exchangeTimeMap[exchangeTime];
      const { code, msg = '' } = exchangeMangaShopApi(id, num * cost, num).json();
      console.log(msg)
      // 抢的人太多
      if (code === 4) {
        return 0;
      }
      if (code === 0) {
        console.log(`兑换商品成功，兑换数量：${num}`);
        return num;
      }
      // 太快
      if (code === 1 && msg.includes('快')) {
        return 0;
      }
      // 库存不足，且时间是 xx:01 之前
      if (
        code === 2 &&
        msg.includes('库存') &&
        new Date().getMinutes() < 1
      ) {
        console.log(`库存不足，但时间是 ${exchangeTime}:01 之前，尝试重新兑换`);
        return 0;
      }
      console.warn('商城兑换', code, msg);
    } catch (error) {
      console.error('商城兑换', error.message);
    }
    return -1;
  }

  function singleExchange(num) {
    // 尝试兑换
    while ((exchange(num)) === 0) {
      Time.sleep(random(1949, 2100))
    }
  }

  function exchangeCoupon() {
    const num = getExchangeNum()
    if (!num) return;
    console.log(`需要兑换的数量${num}`)
    return singleExchange(num)
  }

  exchangeCoupon()
}



// 获取当前活动表格
const activeSheet = ActiveSheet
// 获取A列
const columnA = activeSheet.Columns("A")
// 获取当前工作表的使用范围
const usedRange = activeSheet.UsedRange

// 存储有值的所有行号
const rowsWithValues = []

// 遍历A列，记录有值的所有行号
for (let i = 2; i <= usedRange.Row + usedRange.Rows.Count - 1; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text && getCookieItem(cell.Text, 'SESSDATA')) {
    console.log(`执行第 ${i} 行`)
    run(i)
  }
}
