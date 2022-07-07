// pages/detail-video/index.js
import { getMVURL, getMVDetail, getRelatedVideo } from '../../service/api_video';

Page({
  data: {
    mvURLInfo: {},
    mvDetail: {},
    relatedVideos: {},
    isLove: false,
    active: '简介',
    showLoading: true,
    isPlayingMusic: false
  },
  onLoad(options) {
    const { id } = options;
    console.log(`来到了音乐详情界面,该MV的id为${id}`);
    this.getPageData(id);
  },
  changeLove() {
    if (!this.data.isLove) {
      this.setData({ isLove: true });
    } else {
      this.setData({ isLove: false });
    }
  },
  play() {
    console.log('play');
    this.setData({ isPlayingMusic: true });
  },
  pause() {
    console.log('pause');
    this.setData({ isPlayingMusic: false });
  },
  onChange(e) {
    console.log(e.detail);
    // wx.showToast({
    //   title: `切换到标签 ${event.detail.name}`,
    //   icon: 'none'
    // });
  },
  /* 像这种各个请求之间没有联系的.就没必要用async await了
  不然下一个请求必须在上一个请求完成后才能进行,这样拿到数据效率会变低
  所以改用传统的Promise的方式,就不会等待了,因为发送网络请求是异步的,所以是不会阻塞我们继续往下走的 */
  getPageData(id) {
    // 1.请求播放地址
    getMVURL(id).then((res) => this.setData({ mvURLInfo: res.data })); //也就是说执行这行代码时不会阻塞下一行
    // 2.请求视频信息
    getMVDetail(id).then((res) => {
      if (res.code === 200) {
        this.setData({ mvDetail: res.data, showLoading: false });
      }
    });
    // 3.请求相关视频
    getRelatedVideo(id).then((res) => this.setData({ relatedVideos: res.data }));
  }
});
