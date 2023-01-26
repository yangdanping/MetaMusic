// pages/detail-video/detail-video.js
import { getMVURL, getMVDetail, getMVInfo, getRelatedVideo, getMVComment, getVideoDetail, getVideoURL, getVideoInfo } from '../../service/api_video';

Page({
  data: {
    mvURLInfo: {},
    mvDetail: {},
    mvInfo: {},
    mvComments: null,
    relatedVideos: {},
    active: '简介',
    isLove: false,
    hasMore: true,
    showLoading: true,
    showCommentsLoading: false,
    isPlayingMusic: false
  },
  onLoad(options) {
    const { id, type } = options;
    console.log(`来到了音乐详情界面,该MV的id为${id}`);
    this.getPageData(id, type);
  },
  /* 像这种各个请求之间没有联系的.就没必要用async await了
  不然下一个请求必须在上一个请求完成后才能进行,这样拿到数据效率会变低
  所以改用传统的Promise的方式,就不会等待了,因为发送网络请求是异步的,所以是不会阻塞我们继续往下走的 */
  // 该页面可能是视频或音乐mv之中的一种,所以用type区分
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
    // 4.请求相关视频(mv或普通视频下方都有其他相关视频)
    getRelatedVideo(id).then((res) => {
      this.setData({ relatedVideos: res.data });
    });
  },
  changeLove() {
    this.setData({ isLove: !this.data.isLove ? true : false });
  },
  play(e) {
    // 获取当前播放视频的唯一标识并赋值
    let vid = e.currentTarget.id;
    // 通过当前视频唯一标识形成实例
    const videoContext = wx.createVideoContext(vid);
    console.log('videoContextvideoContextvideoContext', videoContext);
    this.setData({ isPlayingMusic: true });
  },
  pause() {
    this.setData({ isPlayingMusic: false });
  },
  getComment(offset = 0) {
    this.setData({ showCommentsLoading: true });
    getMVComment(this.data.mvDetail.id,offset).then((res) => {
      if (!this.data.hasMore) return;
      else {
        const comments = res.comments;
        let newData = this.data.mvComments;
        newData = offset === 0 ? comments : newData.concat(comments); // concat用于合并两个/多个数组(此方法不会更改现有数组，而是返回一个新数组)
        this.setData({ mvComments: newData, hasMore: res.more, showCommentsLoading: false });
      }
    });
  },
  onChange(e) {
    const active = e.detail.name;
    this.setData({ active });
    active === '评论' && this.getComment();
  },
  gotoComment() {
    this.onChange();
    this.setData({ active: '评论' });
  },
  //封装事件处理的方法(在组件中设置data-item="{{item}}",event可以拿到)
  handleVideoItemClick(event) {
    // 获取id
    const vid = event.currentTarget.dataset.item.vid;
    //页面跳转
    wx.navigateTo({
      url: `/pages/detail-video/detail-video?id=${vid}&type=video`
    });
  },
  onReachBottom() {
    if (this.data.active === '评论') {
      this.getComment(this.data.mvComments.length); // 注意是0~9后面追加10~19,而非替换
    } else {
      console.log('onReachBottom onReachBottom', this.data.active);
    }
  },

  onHide() {
    let bgAudio = wx.getBackgroundAudioManager();
    console.log('onHide detail-video-------------------', bgAudio);
    if (Object.keys(this.data.mvURLInfo).length) {
      const { artistName, name } = this.data.mvDetail;
      bgAudio.singer = artistName;
      bgAudio.title = name;
      bgAudio.src = this.data.mvURLInfo.url;
    }
  },
  onShow() {
    const bgAudio = wx.getBackgroundAudioManager();
    console.log('onShow detail-video-------------------', bgAudio);
  }
});
