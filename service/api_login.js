import myRequest, { myLoginRequest } from './index';

// 用户登录
export function getLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 1000,
      success: (res) => {
        resolve(res.code);
      },
      fail: (err) => {
        console.log('getLoginCode err', err);
        reject(err);
      }
    });
  });
}
export function codeToToken(code) {
  return myLoginRequest.post('/login', { code });
}

export function checkToken() {
  return myLoginRequest.post('/auth', {}, true); //isAuth传true,那边已配置header传入token
}

export function checkSession() {
  return new Promise((resolve) => {
    wx.checkSession({
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}
export function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
}

// 发送验证码
export function loginByPhone(phone) {
  return myRequest.get('/captcha/sent', { phone });
}

// 验证验证码
export function verifyLogin(phone, captcha) {
  return myRequest.get('/captcha/verify', { phone, captcha });
}

// 获得二维码的key
export function getQRcodeKey() {
  return myRequest.get('/login/qr/key');
}

// 根据key生成二维码
export function createQRcode(key) {
  return myRequest.get('/login/qr/create', { qrimg: true, key });
}

// 验证二维码
export function qrCodeLoginCheck(key) {
  return myRequest.get('/login/qr/check', { key });
}
