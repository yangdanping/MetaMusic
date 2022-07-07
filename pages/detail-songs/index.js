// pages/detail-songs/index.js
import { rankingStore } from '../../store/index';
import { getSongMenuDetail } from '../../service/api_music';

Page({
  data: {
    ranking: '',
    songInfo: {},
    type: ''
  },
  onLoad(options) {
    // 1.获取页面数据
    const type = options.type;
    this.setData({ type });
    if (type === 'menu') {
      const id = options.id;
      console.log(id);
      getSongMenuDetail(id).then((res) => this.setData({ songInfo: res.playlist }));
    } else if (type === 'rank') {
      const ranking = options.ranking;
      rankingStore.onState(ranking, this.getRankingDataHandler);
    }
  },
  onUnload() {
    // 页面销毁后取消监听
    this.data.ranking && rankingStore.offState(this.data.ranking, this.getRankingDataHanlder);
  },
  getRankingDataHandler(res) {
    this.setData({ songInfo: res });
  }
});
