// app.js
App({
  // globalData只用于保存和共享一些不会变的全局数据(如屏幕宽高),不能做到数据响应式
  globalData: {
    screenWidth: 0,
    screenHeight: 0
  },
  onLaunch() {
    const info = wx.getSystemInfoSync();
    this.globalData.screenWidth = info.screenWidth;
    this.globalData.screenHeight = info.screenHeight;
    // 外部通过 const app = getApp() 获取到globalData中的数据
    console.log('设备屏幕宽度 -->', this.globalData.screenWidth);
  }
});
