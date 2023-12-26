const random = (a, b) => Math.floor(Math.random() * b + a)
const getCookieItem = (cookie, key) => {
  if (!cookie) return null;
  const reg = `(?:^| )${key}=([^;]*)(?:;|$)`;
  const r = cookie.match(reg);
  return r ? r[1] : null;
}

const clockInUrl = 'https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn?platform=android',
  shareComicUrl = 'https://manga.bilibili.com/twirp/activity.v1.Activity/ShareComic?platform=android&channel=bilicomic&mobi_app=android_comic&is_teenager=0',
  seasonInfoUrl = 'https://manga.bilibili.com/twirp/user.v1.SeasonV2/GetSeasonInfo?device=android&platform=android&channel=bilicomic&mobi_app=android_comic&is_teenager=0'
mangaDetailUrl = 'https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?device=android&platform=android&version=4.16.0&mobi_app=android_comic&is_teenager=0'

function run(row) {
  const getValue = (str) => Application.Range(str + row).Text
  const cookie = getValue("A"),
    userAgent = getValue("B") || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    mid = getValue("C") || getCookieItem(cookie, 'DedeUserID'),
    isSign = getValue("D"),
    isShare = getValue('E'),
    isRead = getValue('F')
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

  const clockInApi = () => request(clockInUrl),
    shareComicApi = () => request(shareComicUrl),
    seasonInfoApi = () => request(seasonInfoUrl, { body: 'type=1' }),
    mangaDetailApi = (comic_id) => request(mangaDetailUrl, { body: 'comic_id=' + comic_id })

  function mangaSign() {
    if (isSign !== '是') {
      return;
    }
    console.log('漫画签到')
    try {
      const { code, msg } = clockInApi().json()
      switch (code) {
        case 0:
          return console.log('漫画签到成功');
        case 1:
        case 'invalid_argument':
          return console.log('已经签过到了');
        default:
          return console.log(`漫画签到失败：${code}-${msg}`);
      }
    } catch (error) {
      console.error(`漫画签到`, error.message);
    }
  }

  function shareComic() {
    if (isShare !== '是') {
      return;
    }
    console.log('漫画分享')
    try {
      const { code, msg } = shareComicApi().json();
      if (code === 0) {
        console.log(msg || '每日分享成功！');
        return;
      }
      console.log(`每日分享失败：${code} ${msg}`);
    } catch (error) {
      console.log(`每日分享异常：`, error.message);
    }
  }

  function getNeedReadManga() {
    try {
      return seasonInfoApi().json().data.day_task.book_task.filter(task => task.user_read_min < 5)
    } catch (e) {
      console.error(e.message)
    }
    return []
  }

  function getMangaEpList(id) {
    try {
      return mangaDetailApi(id).json().data.ep_list
    } catch (e) {
      console.error(e.message)
    }
    return []
  }

  function getRandomMangaEp(id) {
    const mangaEpList = getMangaEpList(id)
    if (!mangaEpList || mangaEpList.length === 0) return {}
    return mangaEpList[random(0, mangaEpList.length)]
  }


  function readManga() {
    if (isRead !== '是') return
    console.log('漫画阅读')
    const needReadManga = getNeedReadManga()
    for (const { user_read_min, read_min, id, title } of needReadManga) {
      console.log(`开始阅读漫画：${id}[${title}]`);
      const epid = (getRandomMangaEp(id) || {}).id || random(1, 1000)
      try {
        const res = HTTP.get(`https://bo.js.cool/api/read_manga?mid=${mid}&comic=${id}&ep=${epid}&time=${read_min - user_read_min}`)
        console.log(res.json())
      } catch (e) {
        console.error(e.message)
      }
    }
  }


  mangaSign()
  shareComic()
  readManga()

}

// 切换表
Application.Sheets.Item('签到').Activate()
// 获取A列
const columnA = ActiveSheet.Columns("A")
// 获取当前工作表的使用范围
const usedRange = ActiveSheet.UsedRange

// 存储有值的所有行号
const rowsWithValues = []

// 遍历A列，记录有值的所有行号
for (let i = usedRange.Row; i <= usedRange.Row + usedRange.Rows.Count - 1; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text && getCookieItem(cell.Text, 'SESSDATA')) {
    console.log(`执行第 ${i} 行`)
    run(i)
  }
}
