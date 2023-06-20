import { TOKEN_KEY } from '../constants/token-const';
// const BASE_URL = 'http://123.207.32.32:9001';
const BASE_URL = 'https://netease-cloud-music-api-olive-kappa.vercel.app';
// const BASE_URL = 'https://netease-cloud-music-8qfpm1axr-yangdanping.vercel.app';
const LOGIN_BASE_URL = 'http://123.207.32.32:3000';

const token = wx.getStorageSync(TOKEN_KEY);

class MetaRequest {
  constructor(baseURL, authHeader = {}) {
    this.baseURL = baseURL;
    this.authHeader = authHeader;
  }

  request(url, data, method, isAuth = false, header = {}) {
    const finalHeader = isAuth ? { ...this.authHeader, ...header } : header;

    // 用ES6的Promise将请求结果给调用者回调过去
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseURL}${url}`,
        data,
        method,
        header: finalHeader,
        success: (res) => resolve(res.data),
        fail: (err) => reject(err)
      });
    });
  }
  get(url, params, isAuth = false, header) {
    return this.request(url, params, 'GET', isAuth, header);
  }
  post(url, data, isAuth = false, header) {
    return this.request(url, data, 'POST', isAuth, header);
  }
  delete(url, data, isAuth = false, header) {
    return this.request(url, data, 'DELETE', isAuth, header);
  }
  put(url, data, isAuth = false, header) {
    return this.request(url, data, 'PUT', isAuth, header);
  }
}

const myRequest = new MetaRequest(BASE_URL);
const loginRequest = new MetaRequest(LOGIN_BASE_URL, { token });

export default myRequest;

export { loginRequest };
