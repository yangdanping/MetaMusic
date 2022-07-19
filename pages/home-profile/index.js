// pages/home-profile/index.js
import { loginByPhone, verifyLogin, getQRcodeKey, createQRcode, qrCodeLoginCheck } from '../../service/api_login';

Page({
  data: {
    userInfo: null,
    imgUrl: '',
    isShow: false,
    showDialog: false,
    phone: '',
    btnDisabled: false,
    btnValue: '获取验证码',
    second: 10,
    code: '',
    qrimg: ''
  },

  // 二维码登录--------------------------------------------------------------------
  async qrCodeLogin() {
    const res = await getQRcodeKey();
    console.log('getQRcodeKeygetQRcodeKey', res);
    const key = res.data.unikey;
    if (res.code === 200) {
      const qrCodeResult = await createQRcode(key);
      if (qrCodeResult.code === 200) {
        this.setData({ qrimg: qrCodeResult.data.qrimg });
      }
    }
    // 800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功
    // 每三秒轮询一次
    let check = setInterval(async () => {
      let res = await qrCodeLoginCheck(key);
      console.log('qrCodeLoginCheckqrCodeLoginCheckqrCodeLoginCheck', res);
      res.code == 800 && clearInterval(check);
      if (res.code === 803) {
        clearInterval(check);
        wx.setStorage({
          key: 'cookie', //key保证得是唯一的
          data: res.cookie, //在缓存时就保存起来,用到的时候
          success: (res) => console.log('setStorage', res)
        });
      }
    }, 3000);
    // console.log('checkcheckcheckcheckcheck', check);
  },

  // 手机验证码登录--------------------------------------------------------------------
  verifyCode() {
    if (!this.data.phone || !this.data.code) return;
    verifyLogin(this.data.phone, this.data.code).then((res) => {
      console.log('verifyLogin resresresres', res);
    });
  },
  getCode() {
    if (!this.data.phone) return;
    this.timer();
    console.log('this.data.phone', this.data.phone);
    loginByPhone(this.data.phone).then((res) => {
      console.log('getCodeget resresresres', res);
    });
  },
  timer() {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(() => {
        var second = this.data.second - 1;
        this.setData({
          second,
          btnValue: second + '秒',
          btnDisabled: true
        });
        if (this.data.second <= 0) {
          this.setData({
            second: 10,
            btnValue: '获取验证码',
            btnDisabled: false
          });
          resolve(setTimer);
        }
      }, 1000);
    });
    promise.then((setTimer) => {
      clearInterval(setTimer);
    });
  },
  close() {
    this.setData({ phone: '', code: '' });
  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    console.log('getUserProfile getUserProfile');
    this.setData({ showDialog: true });

    // wx.getUserProfile({
    //   desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //   success: (res) => {
    //     console.log(res);
    //     wx.setStorage({
    //       data: res,
    //       key: '登录信息'
    //     });
    //     this.setData({
    //       userInfo: res.userInfo,
    //       imgUrl: res.userInfo.avatarUrl,
    //       isShow: true
    //     });
    //   },
    //   fail: (e) => console.log(e)
    // });
  }
});
