// pages/music-player/music-player.js
import { getSongDetail, getAlbumDetail } from '../../service/api_player';
const { screenHeight, statusBarHeight, navBarHeight, deviceRadio } = getApp().globalData;
const contentHeight = screenHeight - statusBarHeight - navBarHeight; // 动态计算内容高度
import { audioContext } from '../../store/index'; //在另一个文件单独存放audioContext
Page({
  /**
   * 页面的初始数据
   */
  data: {
    songInfo: {},
    currentPage: 0,
    contentHeight,
    isContinuePlay: false,
    isMusicLyric: deviceRadio > 1.78 ? true : false, //根据屏幕比例动态决定是否显示歌词
    modes: ['order', 'random', 'repeat'],
    mode: 'order',
    time: '00:00'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;
    console.log('song id', id);
    this.getPageData(id);

    // 使用全局的audioContext
    audioContext.stop(); //切歌
    // 服务器获取音频流 -> 客户端 -> 解码 -> 播放
    audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
    // audioContext.play();
    // 由于需要上述流程,所以最好监听播放事件,能播的时候才播
    // audioContext.autoplay = true;
    audioContext.onCanplay(() => {
      this.setData({ isContinuePlay: true });
      audioContext.play();
    });
  },
  getPageData(id) {
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
        },
        duration: song.dt //歌曲时长
      };
      this.setData({ songInfo });
    });
  },

  handleAlbumClick(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail-songs/detail-songs?id=${id}&type=album`
    });
  },
  handleSwiperChange(e) {
    const current = e.detail.current;
    this.setData({ currentPage: current });
  },
  changeMode(e) {
    const mode = e.currentTarget.dataset.mode;
    const modes = this.data.modes;
    let nextIndex = modes.findIndex((item) => item === mode);
    if (nextIndex >= 2) {
      nextIndex = 0;
    } else {
      nextIndex += 1;
    }
    console.log('mode', modes[nextIndex]);
    this.setData({ mode: modes[nextIndex] });
  },
  pause() {
    console.log('pausepausepause');
    const isContinuePlay = this.data.isContinuePlay;
    if (isContinuePlay) {
      this.setData({ isContinuePlay: !isContinuePlay });
      audioContext.pause();
    } else {
      this.setData({ isContinuePlay: !isContinuePlay });
      audioContext.play();
    }
  }
});
