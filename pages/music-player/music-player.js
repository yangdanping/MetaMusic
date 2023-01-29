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
    durationTime: 0, //歌曲时长
    currentTime: 0, //当前播放时长
    sliderValue: 0, //滑块进度
    isSliderChanging: false //用来控制拖拽进度条时,进度条是否改变value
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
    // 完成更新时间与进度条的逻辑
    audioContext.onTimeUpdate(() => {
      // 1.改变时间 -> 传来的是s,*1000得到ms
      const currentTime = audioContext.currentTime * 1000;
      // 2.改变进度条 -> 由于slider的值是0~100,所以要*100得到可用于动态修改slider的真实值
      // 当且仅当没有在拖拽中,sliderValue值才改变
      if (!this.data.isSliderChanging) {
        const sliderValue = (currentTime / this.data.durationTime) * 100;
        this.setData({ currentTime, sliderValue });
      }
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
        }
      };
      this.setData({ songInfo, durationTime: song.dt });
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
  },
  // slider事件:点击，拖拽
  handleSliderChange(e) {
    console.log('handleSliderChange', e);
    // 1.获取slider变化的值(返回0~100) e.detail
    const sliderValue = e.detail.value;
    // 2.计算出需要播放的currentTime
    const currentTime = (this.data.durationTime * sliderValue) / 100 / 1000; //注意seek()参数需要以秒为单位,所以为了得到s要/1000,
    // 3.设置context播放currentTime位置的音乐(最好先暂停,以保证缓存)
    audioContext.pause();
    audioContext.seek(currentTime);
    // 4.记录最新的sliderValue(注意,拖拽后要isSliderChanging改为false,完成可以继续修改sliderValue和currentTime的逻辑)
    this.setData({ sliderValue, isSliderChanging: false });
  },
  handleSliderChanging(e) {
    console.log('handleSliderChanging', e);
    // 拖拽时同时改变时间
    const sliderValue = e.detail.value;
    const currentTime = (this.data.durationTime * sliderValue) / 100;
    // isSliderChanging改为true,解决拖拽时,handleSliderChange事件也同时在该sliderValue产生的圆点跳动问题
    this.setData({ currentTime, isSliderChanging: true });
  }
});
