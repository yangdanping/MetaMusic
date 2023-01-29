// components/custom-swiper/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    imgUrls: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  lifetimes: {
    ready() {
      // console.log('imgUrlsimgUrlsimgUrls', this.data.imgUrls);
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    swiperChange(e) {
      this.setData({
        currentIndex: e.detail.current
      });
    }
  }
});
