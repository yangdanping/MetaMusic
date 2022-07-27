// pages/home-video/index.js
import { getTopMVs, getMVURL } from '../../service/api_video';

Page({
  //页面的初始数据
  data: {
    mvURLInfo: {},
    topMVs: [],
    hasMore: true, //判断是否还有最新数据
    scrollTop: 0,
    showLoading: false
  },
  // 封装网络请求的方法
  async getTopMVData(offset = 0) {
    // 判断是否可以请求(offset为0说明为第一次请求,此时若hasMore初始为false也能进行请求)
    if (!this.data.hasMore && offset !== 0) return;
    let limit = 10;
    // if (offset === 0) limit = 11; //解决接口第一次请求9条数据的问题
    // 请求前,展示标题中的下拉加载动画
    wx.showNavigationBarLoading();
    // 开始真正请求数据
    const res = await getTopMVs(offset, limit);
    console.log('拿到了元数据', res);
    if (res.code === 200) {
      let newData = this.data.topMVs;

      // offset为0说明是第一次请求/上拉加载更多
      newData = offset === 0 ? res.data : newData.concat(res.data); // concat用于合并两个/多个数组(此方法不会更改现有数组，而是返回一个新数组)
      // 注意!setData在设置data数据上,是同步的(也就是下面console.log(this.data.topMVs);是可以拿到的)
      // 但通过最新数据对wxml进行渲染的过程是异步的(也就是说它不会等渲染完成才执行下面代码)
      this.setData({ topMVs: newData });
      this.setData({ hasMore: res.hasMore }); //每次请求保存最新的传来的hasMore值,若超过数据偏移量则没有更多了,则不会再请求,也不会再报错
      wx.hideNavigationBarLoading(); //请求成功后关闭转圈动画
      offset === 0 && wx.stopPullDownRefresh(); //数据过来后就主动停掉下拉加载动画
    } else {
      wx.showToast({ title: '请求失败', icon: 'error' });
    }
  },
  //生命周期函数--监听页面加载(用async await用同步的方式编写异步代码)
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

  //封装事件处理的方法(在组件中设置data-item="{{item}}",event可以拿到)
  handleVideoItemClick(event) {
    // 获取id
    const id = event.currentTarget.dataset.item.id;
    //页面跳转
    wx.navigateTo({
      url: `/pages/detail-video/detail-video?id=${id}`
    });
  },

  //其他生命周期回调函数(监听用户下拉刷新事件/监听滚动到底部)
  // 下拉刷新要先在.json中配置"enablePullDownRefresh": true
  onPullDownRefresh() {
    console.log('onPullDownRefresh');
    this.setData({ mvURLInfo: {} });
    this.getTopMVData(); //注意!还要配置,"backgroundTextStyle": "dark",不然在白色背景下看不到动画
  },
  onReachBottom() {
    // console.log('this.data.topMVs.length', this.data.topMVs.length);
    this.getTopMVData(this.data.topMVs.length); // 注意是0~9后面追加10~19,而非替换
    // if (!this.data.hasMore) return;
    // const res = await getTopMVs(this.data.topMVs.length);
    // this.setData({ topMVs: this.data.topMVs.concat(res.data) });
    // this.setData({ hasMore: res.hasMore });
  },
  onPageScroll(e) {
    // console.log(e.scrollTop);
    this.setData({ scrollTop: e.scrollTop });
  },
  backTop() {
    wx.pageScrollTo({ scrollTop: 0 });
  },
  handleLongPress(e) {
    console.log(e);
    this.setData({ showLoading: true });
    getMVURL(e.currentTarget.dataset.item.id).then((res) => {
      this.setData({ mvURLInfo: res.data, showLoading: false });
    }); //也就是说执行这行代码时不会阻塞下一行
  },
  colseVideo() {
    this.setData({ mvURLInfo: {} });
  }
});
