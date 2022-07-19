// pages/detail-songs/index.js
import { rankingStore } from '../../store/index';
import { getSongsDetail } from '../../service/api_music';

Page({
  data: {
    ranking: '',
    songInfo: {},
    songs: [],
    options: {},
    hasMore: true
  },
  onLoad(options) {
    // 1.获取页面数据
    const { type, id } = options;
    this.setData({ options });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('getMenuData', (res) => {
      console.log('eventChannel获得歌单信息----------------------------', res);
      this.setData({ songInfo: res });
    });
    this.getSongsDetail(type, id);
  },
  getSongsDetail(type, id, offset = 0) {
    this.setData({ hasMore: true });
    if (type === 'menu') {
      getSongsDetail(id, offset).then((res) => {
        let newData = this.data.songs;
        newData = offset === 0 ? res.songs : newData.concat(res.songs);
        this.setData({ hasMore: false, songs: newData });
      });
    } else if (type === 'rank') {
      const { ranking } = this.data.options;
      rankingStore.onState(ranking, this.getRankingDataHandler);
    }
  },
  onUnload() {
    // 页面销毁后取消监听
    this.data.ranking && rankingStore.offState(this.data.ranking, this.getRankingDataHanlder);
  },
  onReachBottom() {
    //只请求菜单内的歌曲
    const { type, id } = this.data.options;
    if (type === 'menu') {
      this.getSongsDetail(type, id, this.data.songs.length);
    }
  },
  getRankingDataHandler(res) {
    this.setData({ songInfo: res, songs: res.tracks });
  }
});
