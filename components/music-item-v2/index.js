// components/music-item-v2/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    },
    index: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleSongItemClick() {
      const id = this.properties.item.id;
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`
      });
    }
  }
});
