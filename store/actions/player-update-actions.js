import { audioContext, playerStore } from '../../store/index';

export const setupAudioContextListenerAction = (ctx) => {
  //1.监听歌曲可以播放
  audioContext.onCanplay(() => {
    audioContext.play();
  });
  //2.监听歌曲时间的改变(完成更新时间与进度条的逻辑)
  audioContext.onTimeUpdate(() => {
    // 1.获取并修改当前时间 -> 传来的是s,*1000得到ms
    const currentTime = audioContext.currentTime * 1000; //单位ms
    ctx.currentTime = currentTime;
    // 2.根据当前时间查找要播放的歌词
    // 获取当前的currentTime,currentTime与每一行歌词时间逐一对比,若某行的歌词时间小于currentTime,这行的前一行就是要匹配的歌词
    // if (!ctx.lyricInfo.length) return;
    const currentIndex = ctx.lyricInfo.findIndex((item) => currentTime < item?.time) - 1;
    // 避免重复设置
    if (ctx.currentLyricIndex !== currentIndex) {
      const currentLyric = ctx.lyricInfo[currentIndex]?.text;
      ctx.currentLyric = currentLyric;
      ctx.currentLyricIndex = currentIndex;
      console.log('onTimeUpdate计算出当前歌词', ctx.currentLyric);
      // lyricScrollTop属于页面的东西,store中不保存
    }
  });
  // 3.监听歌曲播放完成时播下一首
  audioContext.onEnded(() => {
    playerStore.dispatch('changeNewMusicAction', true);
  });

  // 4.监听歌曲暂停/播放
  audioContext.onPlay(() => {
    ctx.isPlaying = true;
  });
  audioContext.onPause(() => {
    ctx.isPlaying = false;
  });
  audioContext.onStop(() => {
    ctx.isPlaying = false;
    ctx.isStoping = true;
  });
};

export const changeMusicPlayStatusAction = (ctx, isPlaying = true) => {
  console.log('changeMusicPlayStatusAction', `${!isPlaying ? '暂停' : '播放'}`);
  ctx.isPlaying = isPlaying;
  // 准备播放但当前处于停止状态的情况下,重新获取src和title
  if (ctx.isPlaying && ctx.isStoping) {
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${ctx.id}.mp3`;
    audioContext.title = ctx.currentSong.name; //存放真实的title,替换setupPlayerAction中我们临时存的title
    // audioContext.startTime = ctx.currentTime / 1000;
    ctx.isStoping = false;
  }
  ctx.isPlaying ? audioContext.play() : audioContext.pause();
};
// export const changeMusicPlayStatusAction = (ctx, isPlaying = true) => {
//   console.log('changeMusicPlayStatusAction', `${!isPlaying ? '暂停' : '播放'}`);
//   ctx.isPlaying = isPlaying;
//   ctx.isPlaying ? audioContext.play() : audioContext.pause();
// };

/**
 *
 * @param {*} ctx store上下文
 * @param {boolean} isNext 是否是下一首歌曲
 */
export const changeNewMusicAction = (ctx, isNext = true) => {
  // 1.获取当前索引
  let index = ctx.playListIndex;
  const playList = ctx.playListSongs;
  // 2.根据不同的播放模式,改变歌曲索引(单曲循环不变)
  switch (ctx.mode) {
    case 'order': // 顺序播放
      index = isNext ? index + 1 : index - 1;
      if (index === playList.length) index = 0; //已经是最后一首歌时,则回到第一首歌
      if (index === -1) index = playList.length - 1; //已经是第一首歌时,则跳到最后一首歌
      console.log(`changeNewMusicAction 顺序播放 ${isNext ? '下' : '上'}一首歌索引:`, index);
      break;
    case 'repeat': // 单曲循环
      console.log('changeNewMusicAction 单曲循环 不改变索引');
      break;
    case 'random': // 随机播放
      const currentIndex = index;
      do {
        index = Math.floor(Math.random() * playList.length); //Math.floor 向下取整
      } while (currentIndex === index); //随机到当前歌曲则继续生成随机数
      console.log('changeNewMusicAction 随机播放 随机歌曲索引:', index, isNext);
      break;
  }

  // // 3.获取歌曲
  let switchedSong = ctx.playListSongs[index];
  // 若currentSong无值,说明是顺序播放但列表只有一首歌的情况,则直接用当前歌曲
  if (!switchedSong) {
    switchedSong = ctx.currentSong;
  } else {
    // 切换歌曲后(顺序/随机播放),要记录新的索引
    ctx.playListIndex = index;
  }
  console.log('changeNewMusicAction 得到歌曲的完整信息', switchedSong);

  // // 4.播放新的歌曲
  playerStore.dispatch('playBySongIdAction', { id: switchedSong.id, isRefresh: true });
};
