// 单独的js文件也可以共享对象
// 创建一个全局的audioContext,可以在各个地方使用
import { HYEventStore as EventStore } from 'hy-event-store';
import { getSongInfoAction, setupPlayerAction } from './actions/player-info-actions';
import { setupAudioContextListenerAction, changeMusicPlayStatusAction, changeNewMusicAction } from './actions/player-update-actions';

// const audioContext = wx.createInnerAudioContext();
// const isInnerAudioContext = true;

const audioContext = wx.getBackgroundAudioManager(); //获取全局唯一的背景音频管理,实现背景播放(必须增加title属性)
const isInnerAudioContext = false;
const playerStore = new EventStore({
  state: {
    isInnerAudioContext,
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
    // 歌曲列表数据---------------------------------
    playListSongs: [], //用户点击那首歌所在的歌曲列表
    playListIndex: 0
  },
  actions: {
    playBySongIdAction(ctx, { id, isRefresh = false }) {
      console.log('playBySongIdAction', ctx.id, id);
      //若点击的已是当期正在播放的歌曲,则无需再请求,isRefresh决定是否强制刷新歌曲,默认不刷新,id有可能是字符串所以用双等号判断
      if (ctx.id == id && !isRefresh) {
        this.dispatch('changeMusicPlayStatusAction', true);
        return;
      }
      ctx.id = id;
      // 1.根据id请求歌曲/歌词数据,并修改播放状态----------------------------------------------------
      this.dispatch('getSongInfoAction', id);
      // 2.播放对应id的歌曲----------------------------------------------------
      this.dispatch('setupPlayerAction', id);
      // 3.监听播放内容(时间/歌词)更新,注意,让audioContext只添加一次监听----------------------------------------------------

      if (ctx.isFirstPlay) {
        this.dispatch('setupAudioContextListenerAction', audioContext);
        ctx.isFirstPlay = false;
      }
    },
    getSongInfoAction, //网络请求获取歌曲基本信息(时长/歌词等)
    setupPlayerAction,
    setupAudioContextListenerAction, //监听时间/歌词的改变
    changeMusicPlayStatusAction, //监听歌曲状态改变
    changeNewMusicAction //监听歌曲切换
  }
});

export { audioContext, playerStore };
