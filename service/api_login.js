import myRequest from './index';

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
