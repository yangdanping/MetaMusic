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
    this.setData({ options }); //由于下拉刷新等敌法都要用到传来的type, id,所以存入data中
    this.getSongsDetail(type, id);
  },
  getSongsDetail(type, id, offset = 0) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('getMenuData', (res) => {
      console.log('eventChannel获得歌单信息----------------------------', res);
      this.setData({ songInfo: res });
    });
    // 这里写死hasMore仅仅是为了让加载中显示出来,传入数据并没有hasMore
    this.setData({ hasMore: true });
    if (type === 'menu') {
      getSongsDetail(id, offset).then((res) => {
        console.log('getSongsDetailgetSongsDetailgetSongsDetailgetSongsDetail', res);
        let newData = this.data.songs;
        newData = offset === 0 ? res.songs : newData.concat(res.songs);
        this.setData({ hasMore: false, songs: newData });
      });
    } else if (type === 'rank') {
      const { ranking } = this.data.options;
      rankingStore.onState(ranking, this.getRankingDataHandler());
    }
  },
  getRankingDataHandler() {
    return (res) => this.setData({ songInfo: res, songs: res.tracks });
  },
  onUnload() {
    // 页面销毁后取消监听
    this.data.ranking && rankingStore.offState(this.data.ranking, this.getRankingDataHandler());
  },
  onReachBottom() {
    //只请求菜单内的歌曲
    const { type, id } = this.data.options;
    if (type === 'menu') {
      console.log('是菜单歌曲数据,要发送网络请求,得到后面的歌曲');
      this.getSongsDetail(type, id, this.data.songs.length);
    } else {
      console.log('是榜单数据,已固定为100个');
    }
  }
});
