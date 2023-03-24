// components/music-item-v2/index.js
import { playerStore } from '../../store/index';

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
      // 1.拿到歌曲id
      const id = this.properties.item.id;
      // 2.页面跳转
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`
      });
      // 3.根据id对歌曲数据进行请求
      playerStore.dispatch('playBySongIdAction', { id });
    }
  }
});
