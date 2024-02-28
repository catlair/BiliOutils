import { webHeartbeat } from '@/net/video.request';

(async () => {
  // console.log(await uploadVideoHeartbeat(538342349, 200));
  console.log(
    await webHeartbeat({
      start_ts: Math.floor(Date.now() / 1000) - 2000,
      played_time: 2000,
      type: 3,
      sub_type: 0,
      aid: 538203218,
      cid: 1392855575,
      dt: 2,
      play_type: 2,
      realtime: 0,
      real_played_time: 0,
      refer_url: '',
      quality: 116,
      video_duration: 248,
      last_play_progress_time: 6,
      max_play_progress_time: 6,
      outer: 0,
      spmid: '333.788.0.0',
      from_spmid: '',
      session: '0008d054534478629016c5f3f3c1f4d3',
      extra: '{"player_version":"4.7.12"}',
    }),
  );
})();
