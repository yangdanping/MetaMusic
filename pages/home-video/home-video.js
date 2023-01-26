// pages/home-video/index.js
import { getTopMVs, getMVURL } from '../../service/api_video';

Page({
  //页面的初始数据
  data: {
    mvURLInfo: {},
    topMVs: [],
    hasMore: true, //判断是否还有最新数据,由请求下来的参数进行更新
    scrollTop: 0,
    showLoading: false
  },

  //生命周期函数--监听页面加载
  onLoad(options) {
    this.getTopMVData(); //请求3.0
    // 请求2.0 ----------------------------------------------------
    // myRequest.get('/top/mv', { offset: 0, limit: 10 }).then((res) => {
    //   console.log(res.data);
    //   this.setData({ topMVs: res.data });
    // });
    // 请求1.0 ----------------------------------------------------
    // wx.request({
    //   url: 'http://123.207.32.32:9001/top/mv',
    //   data: {
    //     offset: 0,
    //     limit: 10
    //   },
    //   success: (res) => {
    //     console.log(res.data.data);
    //     // this.setData({ topMVs: res.data.data });
    //   },
    //   fail: (err) => {
    //     console.log(err);
    //   }
    // });
  },
  // 请求MV数据的方法(用async await用同步的方式编写异步代码)
  async getTopMVData(offset = 0) {
    // 1.请求前,展示标题中的下拉加载动画(注意请求后关闭)
    wx.showNavigationBarLoading();
    if (!this.data.hasMore && offset !== 0) return; // 判断是否可以请求(offset为0说明为第一次请求,此时若hasMore初始为false也能进行请求)
    let limit = 10;
    // 2.开始真正请求数据
    const res = await getTopMVs(offset, limit);
    console.log('拿到了元数据', res);
    if (res.code === 200) {
      let newData = this.data.topMVs;
      newData = offset === 0 ? res.data : newData.concat(res.data); // concat用于合并两个/多个数组(此方法不会更改现有数组，而是返回一个新数组)
      console.log('newDatanewDatanewDatanewData', newData);
      this.setData({ topMVs: newData, hasMore: res.hasMore }); //每次请求保存最新的传来的hasMore值,若超过数据偏移量则没有更多了,则不会再请求,也不会再报错
      //3.请求成功后(即数据添加到末尾后)关闭转圈动画,并主动停掉下拉加载动画
      wx.hideNavigationBarLoading();
      offset === 0 && wx.stopPullDownRefresh();
    } else {
      wx.showToast({ title: '请求失败', icon: 'error' });
    }
  },
  // 监听MV页面中每个mv的点击
  handleVideoItemClick(event) {
    // 获取id
    const id = event.currentTarget.dataset.item.id;
    //页面跳转,在那边option可拿到id
    wx.navigateTo({
      url: `/pages/detail-video/detail-video?id=${id}`
    });
  },
  // 返回顶部方法
  backTop() {
    wx.pageScrollTo({ scrollTop: 0 });
  },
  // 长按获取mv方法
  handleLongPress(e) {
    const id = e.currentTarget.dataset.item.id;
    console.log('长按获取到的视频id为', id);
    this.setData({ showLoading: true });
    getMVURL(id).then((res) => {
      this.setData({ mvURLInfo: res.data, showLoading: false });
    }); //执行这行代码时不会阻塞下一行
  },
  // 关闭mv方法
  colseVideo() {
    this.setData({ mvURLInfo: {} });
  },
  //其他生命周期回调函数(监听用户下拉刷新事件 onPullDownRefresh/监听滚动到底部 onReachBottom)
  //注意!还要配置,"backgroundTextStyle": "dark",不然在白色背景下看不到动
  onPullDownRefresh() {
    console.log('监听用户下拉刷新事件 onPullDownRefresh');
    this.getTopMVData();
  },
  onReachBottom() {
    console.log('监听滚动到底部 onReachBottom');
    this.getTopMVData(this.data.topMVs.length); // 注意是0~9后面追加10~19,而非替换
    // if (!this.data.hasMore) return;
    // const res = await getTopMVs(this.data.topMVs.length);
    // this.setData({ topMVs: this.data.topMVs.concat(res.data) });
    // this.setData({ hasMore: res.hasMore });
  },
  onPageScroll(e) {
    this.setData({ scrollTop: e.scrollTop });
  }
});
