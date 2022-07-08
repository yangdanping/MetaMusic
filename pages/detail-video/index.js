// pages/detail-video/index.js
import { getMVURL, getMVDetail, getMVInfo, getRelatedVideo, getMVComment, getVideoDetail, getVideoURL, getVideoInfo } from '../../service/api_video';

Page({
  data: {
    mvURLInfo: {},
    mvDetail: {},
    mvInfo: {},
    mvComments: {},
    relatedVideos: {},
    active: '简介',
    isLove: false,
    showLoading: true,
    isPlayingMusic: false
  },
  onLoad(options) {
    const { id, type } = options;
    console.log(`来到了音乐详情界面,该MV的id为${id}`);
    this.getPageData(id, type);
  },
  changeLove() {
    this.setData({ isLove: !this.data.isLove ? true : false });
  },
  play() {
    this.setData({ isPlayingMusic: true });
  },
  pause() {
    this.setData({ isPlayingMusic: false });
  },
  onChange(e) {
    console.log(e.detail);
    getMVComment(this.data.mvDetail.id).then((res) => this.setData({ mvComments: res.comments }));
  },
  //封装事件处理的方法(在组件中设置data-item="{{item}}",event可以拿到)
  handleVideoItemClick(event) {
    // 获取id
    const vid = event.currentTarget.dataset.item.vid;
    //页面跳转
    wx.navigateTo({
      url: `/pages/detail-video/index?id=${vid}&type=video`
    });
  },
  /* 像这种各个请求之间没有联系的.就没必要用async await了
  不然下一个请求必须在上一个请求完成后才能进行,这样拿到数据效率会变低
  所以改用传统的Promise的方式,就不会等待了,因为发送网络请求是异步的,所以是不会阻塞我们继续往下走的 */
  getPageData(id, type) {
    if (type === 'video') {
      getVideoURL(id).then((res) => {
        console.log('getVideoURL resresres', res);
        this.setData({ mvURLInfo: res.urls[0] });
      });
      getVideoDetail(id).then((res) => {
        console.log('getVideoDetail resresres', res);
        if (res.code === 200) {
          this.setData({ mvDetail: res.data, showLoading: false });
          getVideoInfo(id).then((res) => {
            console.log('getVideoInfo resresres', res);
            this.setData({ mvInfo: res });
          });
        }
      });
    } else {
      // 1.请求mv播放地址
      getMVURL(id).then((res) => this.setData({ mvURLInfo: res.data })); //也就是说执行这行代码时不会阻塞下一行
      // 2.请求MV信息
      getMVDetail(id).then((res) => {
        if (res.code === 200) {
          this.setData({ mvDetail: res.data, showLoading: false });
          getMVInfo(id).then((res) => {
            this.setData({ mvInfo: res });
          });
        }
      });
    }
    // 4.请求相关视频
    getRelatedVideo(id).then((res) => {
      this.setData({ relatedVideos: res.data });
    });
  }
});
