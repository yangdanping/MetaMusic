import { getSongDetail, getSongLyric } from '../../service/api_player';
import { parseLyric } from '../../utils/parse-lyric';
import { audioContext } from '../../store/index';

export const getCurrentSongAction = (ctx, id) => {
  // 清除上一次残留的播放信息(不改模式)并修改播放状态为播放
  ctx.isPlaying = true;
  ctx.currentSong = {};
  ctx.lyricInfo = [];
  ctx.durationTime = 0;
  ctx.currentTime = 0;
  ctx.currentLyric = '';
  ctx.currentLyricIndex = 0;
  // 请求并保存歌曲数据
  getSongDetail(id).then((res) => {
    const song = res.songs[0];
    console.log('网络请求得到当前音乐完整信息,整合后在播放页监听', song);
    const currentSong = {
      id: song.id,
      name: song.name,
      singer: song.ar[0].name,
      cover: song.al.picUrl,
      album: {
        id: song.al.id,
        name: song.al.name
      }
    };
    ctx.currentSong = currentSong; //保存歌曲信息
    ctx.durationTime = song.dt; //保存歌曲时长
    audioContext.title = currentSong.name; //存放真实的title,替换setupPlayerAction中我们临时存的title
  });
  // 请求并保存歌词数据
  getSongLyric(id).then((res) => {
    const lyricString = res.lrc.lyric;
    const lyricInfo = parseLyric(lyricString);
    ctx.lyricInfo = lyricInfo;
  });
};

export const setupPlayerAction = (ctx, id) => {
  console.log('setupPlayerAction-------------------------------------------------------');
  // 要实现多个页面也能更改播放逻辑(如非播放页的切歌),所以也将歌曲播放抽取至公共部分,到时候直接调用这个action即可
  audioContext.stop(); //切歌
  // 服务器获取音频流 -> 客户端 -> 解码 -> 播放
  audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
  if (ctx.isInnerAudioContext) {
    console.log('设置innerAudioContextautoplay为true');
    audioContext.autoplay = true;
  } else {
    console.log('设置backgroundAudioManager为id', id);
    audioContext.title = id; //必须要个title,所以先用id替代
  }
};
