// components/music-menu-area/index.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '默认歌单'
    },
    songMenu: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    screenWidth: app.globalData.screenWidth
    // 让其scroll-view的宽度等于设备屏幕宽度
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleMoreClick() {
      this.triggerEvent('menuMoreClick');
    },
    handleRefreshClick() {
      this.triggerEvent('menuRefreshClick');
    },
    handleMenuItemClick(event) {
      const id = event.currentTarget.dataset.item.id;
      // 增加type字段menu来对不同的类型跳转方式进行区分
      wx.navigateTo({
        url: `/pages/detail-songs/detail-songs?id=${id}&type=menu`,
        success(res) {
          const item = event.currentTarget.dataset.item;
          res.eventChannel.emit('getMenuData', item); //触发事件
        }
      });
    }
  }
});
