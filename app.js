// app.js
import { getLoginCode, codeToToken, checkToken, checkSession } from './service/api_login';
import { TOKEN_KEY } from './constants/token-const';
App({
  // globalData只用于保存和共享一些不会变的全局数据(如屏幕宽高),不能做到数据响应式
  globalData: {
    screenWidth: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 44,
    deviceRadio: 0
  },
  onLaunch() {
    // 1.获取设备基本信息
    const { screenWidth, screenHeight, statusBarHeight } = wx.getSystemInfoSync();
    this.globalData.screenWidth = screenWidth; //设备屏幕宽度
    this.globalData.screenHeight = screenHeight; //设备导航栏高度
    this.globalData.statusBarHeight = statusBarHeight; // 状态栏高度
    // 外部通过 const app = getApp() 获取到globalData中的数据
    this.globalData.deviceRadio = screenHeight / screenWidth; //高比宽 小屏设备(iphone5/6) < 1.78
    console.log('设备屏幕宽度 -->', screenWidth, '设备导航栏高度 -->', statusBarHeight, '高比宽 -->', this.globalData.deviceRadio);

    // 2.用户登录(只获取用户唯一身份)
    this.handleLogin();
  },
  async handleLogin() {
    const token = wx.getStorageSync(TOKEN_KEY);
    const checkResult = await checkToken();
    const isSessionExpire = await checkSession();
    console.log('checkResult', checkResult);
    //若token过期或者不存在token,则进行重新登录
    if (!token || checkResult.errorCode || !isSessionExpire) {
      this.loginAction();
    } else {
      console.log('token和session没有过期,用户无需重新登录');
    }
  },
  async loginAction() {
    // 1.获取code
    const code = await getLoginCode();
    console.log(code);
    // 2.将code发送给服务器
    const res = await codeToToken(code);
    console.log('loginAction得到token', res.token);
    wx.setStorageSync(TOKEN_KEY, res.token);
  }
});
