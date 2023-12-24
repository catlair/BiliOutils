const getValue = (str) => Application.Range(str).Text
const random = (a, b) => Math.floor(Math.random() * b + a)

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

const cookie = getValue("A2"),
  mid = getValue("B2"),
  userAgent = getValue("C2"),
  isSign = getValue("D2"),
  isShare = getValue('E2'),
  isRead = getValue('F2')

const clockInUrl = 'https://manga.bilibili.com/twirp/activity.v1.Activity/ClockIn?platform=android',
  shareComicUrl = 'https://manga.bilibili.com/twirp/activity.v1.Activity/ShareComic?platform=android&channel=bilicomic&mobi_app=android_comic&is_teenager=0',
  seasonInfoUrl = 'https://manga.bilibili.com/twirp/user.v1.SeasonV2/GetSeasonInfo?device=android&platform=android&channel=bilicomic&mobi_app=android_comic&is_teenager=0'
mangaDetailUrl = 'https://manga.bilibili.com/twirp/comic.v1.Comic/ComicDetail?device=android&platform=android&version=4.16.0&mobi_app=android_comic&is_teenager=0'

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
    /**
     * 这是axios报的错误,重复签到后返回的状态码是400
     * 所以将签到成功的情况忽略掉
     */
    const { status, statusCode } = error.response || {};
    if (status === 400 || statusCode === 400) {
      console.log('已经签到过了');
    } else {
      console.log(`漫画签到`, error);
    }
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
    console.log(`每日分享异常：`, error);
  }
}

function getNeedReadManga() {
  try {
    return seasonInfoApi().json().data.day_task.book_task.filter(task => task.user_read_min < 5)
  } catch (e) {
    console.error(e)
  }
  return []
}

function getMangaEpList(id) {
  try {
    return mangaDetailApi(id).json().data.ep_list
  } catch (e) {
    console.error(e)
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
      const res = request(`https://bo.js.cool/api/read_manga?mid=${mid}&comic=${id}&ep=${epid}&time=${read_min - user_read_min}`)
      console.log(res.json())
    } catch (e) {
      console.error(e)
    }
  }
}

mangaSign()
shareComic()
readManga()
