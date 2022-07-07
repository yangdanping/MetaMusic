// pages/home-profile/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    imgUrl: '',
    isShow: false
  },
  // onShow() {
  //   this.getUserProfile();
  // },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        wx.setStorage({
          data: res,
          key: '登录信息'
        });
        this.setData({
          userInfo: res.userInfo,
          imgUrl: res.userInfo.avatarUrl,
          isShow: true
        });
      },
      fail: (e) => console.log(e)
    });
  }
});