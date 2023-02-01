export const setupAudioContextListenerAction = (ctx, audioContext) => {
  //1.监听歌曲可以播放
  audioContext.onCanplay(() => {
    audioContext.play();
  });
  //2.完成更新时间与进度条的逻辑
  audioContext.onTimeUpdate(() => {
    // 1.获取并修改当前时间 -> 传来的是s,*1000得到ms
    const currentTime = audioContext.currentTime * 1000;
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
      console.log('当前歌词', ctx.currentLyric);
      // lyricScrollTop属于页面的东西,store中不保存
    }
  });
};

export const changeMusicPlayStatusAction = (ctx, { audioContext, isPlaying = true }) => {
  ctx.isPlaying = isPlaying;
  ctx.isPlaying ? audioContext.play() : audioContext.pause();
};
