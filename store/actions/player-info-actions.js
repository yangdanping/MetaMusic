import { getSongDetail, getSongLyric } from '../../service/api_player';
import { parseLyric } from '../../utils/parse-lyric';

export const getSongInfoAction = (ctx, id) => {
  if (ctx.id === id) return; //若点击的已是当期正在播放的歌曲,则无需再请求
  ctx.id = id;

  // 清除上一次残留的播放信息(不改模式)并修改播放状态为播放
  ctx.isPlaying = true;
  ctx.songInfo = {};
  ctx.lyricInfo = [];
  ctx.durationTime = 0;
  ctx.currentTime = 0;
  ctx.currentLyric = '';
  ctx.currentLyricIndex = 0;

  getSongDetail(id).then((res) => {
    const song = res.songs[0];
    console.log('getSongDetail', song);
    const songInfo = {
      name: song.name,
      singer: song.ar[0].name,
      cover: song.al.picUrl,
      album: {
        id: song.al.id,
        name: song.al.name
      }
    };
    ctx.songInfo = songInfo; //保存歌曲信息
    ctx.durationTime = song.dt; //保存歌曲时长
  });
  getSongLyric(id).then((res) => {
    const lyricString = res.lrc.lyric;
    const lyricInfo = parseLyric(lyricString);
    ctx.lyricInfo = lyricInfo; //保存歌词信息
  });
};

export const setupPlayerAction = (ctx, { id, audioContext }) => {
  // 要实现多个页面也能更改播放逻辑(如非播放页的切歌),所以也将歌曲播放抽取至公共部分,到时候直接调用这个action即可
  audioContext.stop(); //切歌
  // 服务器获取音频流 -> 客户端 -> 解码 -> 播放
  audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
  audioContext.title = id;
  audioContext.autoplay = true;
};
