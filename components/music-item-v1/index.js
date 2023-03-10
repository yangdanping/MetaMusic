// components/music-item-v1/index.js
import {  playerStore } from '../../store/index'; 


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {} //默认值
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
      // 页面跳转
      wx.navigateTo({
        url: `/pages/music-player/music-player?id=${id}`
      });
      // 对歌曲数据进行请求
      playerStore.dispatch('playMusicWithSongIdAction',{id});
    }
  }
});
