// app.js
App({
  // globalData只用于保存和共享一些不会变的全局数据(如屏幕宽高),不能做到数据响应式
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44
  },
  onLaunch() {
    const info = wx.getSystemInfoSync();
    this.globalData.screenWidth = info.screenWidth;
    this.globalData.screenHeight = info.screenHeight;
    this.globalData.statusBarHeight = info.statusBarHeight; // 状态栏高度
    // 外部通过 const app = getApp() 获取到globalData中的数据
    console.log('设备屏幕宽度 -->', this.globalData.screenWidth);
    console.log('设备导航栏高度 -->', this.globalData.statusBarHeight);
    this.globalData.deviceRadio = info.screenHeight / info.screenWidth; //高比宽 小屏设备(iphone5/6) < 1.78
    console.log('高比宽 -->', this.globalData.deviceRadio);
  },
  onHide() {
    const bgAudio = wx.getBackgroundAudioManager();
    console.log('onHide bgAudiobgAudiobgAudiobgAudiobgAudio', bgAudio);
  },
  onShow() {
    const bgAudio = wx.getBackgroundAudioManager();
    console.log('onShow bgAudiobgAudiobgAudiobgAudiobgAudio', bgAudio);
  }
});
