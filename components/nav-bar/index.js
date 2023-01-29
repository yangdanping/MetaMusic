// components/nav-bar/index.js
const { statusBarHeight, navBarHeight } = getApp().globalData;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: 'Meta Music'
    }
  },
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多 slot 支持
  },
  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight,
    navBarHeight
  },
  // 现在组件的生命周期写在lifetimes中
  lifetimes: {
    ready() {
      console.log('nav-bar lifetimes ready');
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goBack() {
      wx.navigateBack({
        delta: 1
      });
    }
  }
});
