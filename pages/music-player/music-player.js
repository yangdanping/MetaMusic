// pages/music-player/music-player.js
// import { getSongDetail, getSongLyric } from '../../service/api_player';
const { screenHeight, statusBarHeight, navBarHeight, deviceRadio } = getApp().globalData;
const contentHeight = screenHeight - statusBarHeight - navBarHeight; // 动态计算内容高度
import { audioContext, playerStore } from '../../store/index'; //在另一个文件单独存放audioContext
// import { parseLyric } from '../../utils/parse-lyric';
import { lyricItemHeight } from '../../constants/lyricItemHeight';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //歌曲数据(为了实现数据共享,将歌曲实现逻辑抽取到store中)----------------------------------
    songInfo: {}, //歌曲信息(通过网络请求得到)
    lyricInfo: [], //歌词信息(通过网络请求得到)
    durationTime: 0, //歌曲时长(通过网络请求得到)
    isPlaying: false,
    modes: ['order', 'repeat', 'random'], //设置数组来保存播放模式
    mode: 'order',
    currentTime: 0, //当前播放时长
    currentLyric: '', //当前滚动歌词
    currentLyricIndex: 0, //当前滚动歌词index

    //页面数据----------------------------------
    lyricScrollTop: 0, //由每个lyricItemHeight计算出来歌词滚动的距离
    lyricItemHeight, //每个歌词item的高度为35px
    contentHeight, // 动态计算歌曲内容高度
    currentPage: 0, // 控制歌曲内容/歌词页面
    isMusicLyric: deviceRadio > 1.78 ? true : false, //根据屏幕比例动态决定是否显示歌词
    sliderValue: 0, //滑块进度
    isSliderChanging: false //用来控制拖拽进度条时,进度条是否改变value
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const { id } = options;
    console.log('song id', id);
    // this.getPageData(id);
    this.setupPlayerStoreListener();
    // this.setupAudioContextListener(id);
  },

  // setupAudioContextListener(id) {
  // // 使用全局的audioContext
  // audioContext.stop(); //切歌
  // // 服务器获取音频流 -> 客户端 -> 解码 -> 播放
  // audioContext.src = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
  // // audioContext.play();
  // //1.监听歌曲可以播放
  // // 由于需要上述流程,所以最好监听播放事件,能播的时候才播
  // // audioContext.autoplay = true;
  // audioContext.onCanplay(() => {
  //   audioContext.play();
  // });
  // //2.完成更新时间与进度条的逻辑
  // audioContext.onTimeUpdate(() => {
  //   // 1.改变时间 -> 传来的是s,*1000得到ms
  //   const currentTime = audioContext.currentTime * 1000;
  //   // 2.改变进度条 -> 由于slider的值是0~100,所以要*100得到可用于动态修改slider的真实值
  //   // 当且仅当没有在拖拽中,sliderValue值才改变
  //   if (!this.data.isSliderChanging) {
  //     const sliderValue = (currentTime / this.data.durationTime) * 100;
  //     this.setData({ currentTime, sliderValue });
  //   }
  //   // 3.根据当前时间查找要播放的歌词
  //   // 获取当前的currentTime,currentTime与每一行歌词时间逐一对比,若某行的歌词时间小于currentTime,这行的前一行就是要匹配的歌词
  //   const currentIndex = this.data.lyricInfo.findIndex((item) => currentTime < item?.time) - 1;
  //   console.log('currentIndex', currentIndex);
  //   // 避免重复设置
  //   if (this.data.currentLyricIndex !== currentIndex) {
  //     const currentLyric = this.data.lyricInfo[currentIndex]?.text;
  //     this.setData({ currentLyric, currentLyricIndex: currentIndex, lyricScrollTop: currentIndex * lyricItemHeight });
  //     console.log('当前歌词', currentLyric);
  //   }
  // });
  // },
  // getPageData(id) {
  //   getSongDetail(id).then((res) => {
  //     const song = res.songs[0];
  //     console.log('getSongDetail', song);
  //     const songInfo = {
  //       name: song.name,
  //       singer: song.ar[0].name,
  //       cover: song.al.picUrl,
  //       album: {
  //         id: song.al.id,
  //         name: song.al.name
  //       }
  //     };
  //     this.setData({ songInfo, durationTime: song.dt });
  //   });
  //   getSongLyric(id).then((res) => {
  //     const lyricString = res.lrc.lyric;
  //     const lyricInfo = parseLyric(lyricString);
  //     this.setData({ lyricInfo });
  //     console.log('歌词信息', this.data.lyricInfo);
  //   });
  // },

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
  changeStatus() {
    console.log('changeStatus', `${this.data.isPlaying ? '暂停' : '播放'}`);
    playerStore.dispatch('changeMusicPlayStatusAction', { audioContext, isPlaying: !this.data.isPlaying });
    // const isPlaying = this.data.isPlaying;
    // this.setData({ isPlaying: !isPlaying });
    // this.data.isPlaying ? audioContext.play() : audioContext.pause();
  },
  changeMode(e) {
    const modes = this.data.modes;
    const currentMode = e.currentTarget.dataset.mode;
    let currentIndex = modes.findIndex((mode) => mode === currentMode);
    playerStore.setState('mode', modes[currentIndex >= 2 ? 0 : (currentIndex += 1)]);
    // this.setData({ mode: modes[nextIndex] });
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
  },
  goBack() {
    console.log('goBack');
    wx.navigateBack();
  },
  setupPlayerStoreListener() {
    // 1.监听songInfo/lyricInfo/durationTime
    playerStore.onStates(['songInfo', 'lyricInfo', 'durationTime'], ({ songInfo, lyricInfo, durationTime }) => {
      console.log('监听songInfo/lyricInfo/durationTime', songInfo, lyricInfo, durationTime);
      if (songInfo) this.setData({ songInfo }); //第一次拿到的我们在store中初始化的空对象,当我们有新数据的时候,就可以重新回调这个函数,拿到新数据
      if (lyricInfo) this.setData({ lyricInfo });
      if (durationTime) this.setData({ durationTime });
    });
    // 2.监听currentTime/currentLyric/currentLyricIndex
    playerStore.onStates(['currentTime', 'currentLyric', 'currentLyricIndex'], ({ currentTime, currentLyric, currentLyricIndex }) => {
      console.log('监听currentTime/currentLyric/currentLyricIndex', currentTime, currentLyric, currentLyricIndex);
      // 歌曲时间更新------------------------------
      if (currentTime && !this.data.isSliderChanging) {
        const sliderValue = (currentTime / this.data.durationTime) * 100;
        this.setData({ currentTime, sliderValue });
      }
      // 歌词滚动更新------------------------------
      if (currentLyric) this.setData({ currentLyric });
      if (currentLyricIndex) {
        this.setData({ currentLyricIndex, lyricScrollTop: currentLyricIndex * lyricItemHeight });
      }
    });
    // 3.监听播放模式相关数据
    playerStore.onStates(['isPlaying', 'mode'], ({ isPlaying, mode }) => {
      console.log('监听mode/isPlaying', isPlaying, mode);
      if (isPlaying !== undefined) this.setData({ isPlaying }); //由于isPlaying是布尔值,所以设仅传来undefined时不设置isPlaying
      if (mode) this.setData({ mode });
    });
  }
});
