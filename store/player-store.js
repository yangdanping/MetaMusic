// 单独的js文件也可以共享对象
// 创建一个全局的audioContext,可以在各个地方使用
import { HYEventStore as EventStore } from 'hy-event-store';
import { getSongInfoAction, setupPlayerAction } from './actions/player-info-actions';
import { setupAudioContextListenerAction, changeMusicPlayStatusAction } from './actions/player-update-actions';

const audioContext = wx.createInnerAudioContext();

// audioContext.on()
const playerStore = new EventStore({
  state: {
    isFirstPlay: true,
    isStoping: false,

    id: 0,
    songInfo: {}, //歌曲信息(通过网络请求得到)
    lyricInfo: [], //歌词信息(通过网络请求得到)
    durationTime: 0, //歌曲时长(通过网络请求得到)

    currentTime: 0, //当前播放时长
    currentLyric: '', //当前滚动歌词
    currentLyricIndex: 0, //当前滚动歌词index
    isPlaying: false,
    
    mode: 'order',
    // playModeIndex: 0, // 0: 循环播放 1: 单曲循环 2: 随机播放
    playListSongs: [],
    playListIndex: 0
  },
  actions: {
    playMusicWithSongIdAction(ctx, { id }) {
      // 1.根据id请求歌曲/歌词数据,并修改播放状态----------------------------------------------------
      this.dispatch('getSongInfoAction', id);
      // 2.播放对应id的歌曲----------------------------------------------------
      this.dispatch('setupPlayerAction', { id, audioContext });
      // 3.监听播放内容更新----------------------------------------------------
      this.dispatch('setupAudioContextListenerAction', audioContext);
    },
    getSongInfoAction,
    setupPlayerAction,
    setupAudioContextListenerAction,
    changeMusicPlayStatusAction //监听歌曲状态改变

    // changeNewMusicAction(ctx, isNext = true) {
    //   // 1.获取当前索引
    //   let index = ctx.playListIndex;

    //   // 2.根据不同的播放模式, 获取下一首歌的索引
    //   switch (ctx.playModeIndex) {
    //     case 0: // 顺序播放
    //       index = isNext ? index + 1 : index - 1;
    //       if (index === -1) index = ctx.playListSongs.length - 1;
    //       if (index === ctx.playListSongs.length) index = 0;
    //       break;
    //     case 1: // 单曲循环
    //       break;
    //     case 2: // 随机播放
    //       index = Math.floor(Math.random() * ctx.playListSongs.length);
    //       break;
    //   }

    //   console.log(index);

    //   // 3.获取歌曲
    //   let songInfo = ctx.playListSongs[index];
    //   if (!songInfo) {
    //     songInfo = ctx.songInfo;
    //   } else {
    //     // 记录最新的索引
    //     ctx.playListIndex = index;
    //   }

    //   // 4.播放新的歌曲
    //   this.dispatch('playMusicWithSongIdAction', { id: songInfo.id, isRefresh: true });
    // }
  }
});

export { audioContext, playerStore };
