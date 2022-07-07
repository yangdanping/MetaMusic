// const BASE_URL = 'http://123.207.32.32:9001';
const BASE_URL = 'https://netease-cloud-music-api-olive-kappa.vercel.app';

class MetaRequest {
  request(url, data, method) {
    // 用ES6的Promise将请求结果给调用者回调过去
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}${url}`,
        data,
        method,
        success: (res) => resolve(res.data),
        fail: (err) => reject(err)
      });
    });
  }
  get(url, params) {
    return this.request(url, params, 'GET');
  }
  post(url, data) {
    return this.request(url, data, 'POST');
  }
  delete(url, data) {
    return this.request(url, data, 'DELETE');
  }
  put(url, data) {
    return this.request(url, data, 'PUT');
  }
}

export default new MetaRequest();
