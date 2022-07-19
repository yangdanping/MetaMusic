// pages/detail-songs/index.js
import { rankingStore } from '../../store/index';
import { getSongsDetail } from '../../service/api_music';

Page({
  data: {
    ranking: '',
    songInfo: {},
    songs: [],
    type: '',
    id: '',
    hasMore: true
  },
  onLoad(options) {
    // 1.获取页面数据
    const type = options.type;
    const id = options.id;
    this.setData({ type, id });
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('getMenuData', (data) => {
      console.log('eventChannel获得封面背景图----------------------------', data);
      this.setData({ songInfo: data });
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
      const ranking = options.ranking;
      rankingStore.onState(ranking, this.getRankingDataHandler);
    }
  },
  onUnload() {
    // 页面销毁后取消监听
    this.data.ranking && rankingStore.offState(this.data.ranking, this.getRankingDataHanlder);
  },
  onReachBottom() {
    //只请求菜单内的歌曲
    if (this.data.type === 'menu') {
      this.getSongsDetail(this.data.type, this.data.id, this.data.songs.length);
    }
  },
  getRankingDataHandler(res) {
    this.setData({ songInfo: res });
  }
});
