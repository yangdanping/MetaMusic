// pages/home-music/index.js
import { rankingStore, rankingMap, playerStore } from '../../store/index';
import { getBanners, getSongMenu } from '../../service/api_music';
import queryRect from '../../utils/query-rect';
import throttle from '../../utils/throttle';

const throttleQueryRect = throttle(queryRect, 1000, { trailing: true }); //在1s钟内只查询1次，并且开启尾部必执行
const menuCount = 10; //歌单默认更新10条
const hotSongCount = 6; //热门歌曲默认更新6条

Page({
  data: {
    swiperHeight: 0,
    banners: [],
    recommendSongs: [],
    hotSongMenu: [],
    chineseSongMenu: [],
    menuRefreshOffset: 0,
    hotSongRefreshOffset: hotSongCount, //热门歌曲更新默认6条
    // 热门榜(作为推荐歌曲展示):3778678
    // 原创榜:2884035
    // 新歌榜:3779629
    // 飙升榜:19723756
    rankings: { 2884035: {}, 3779629: {}, 19723756: {} }, //若直接是个数组,顺序就会不好确定
    currentSong: {},
    isPlaying: true
  },
  onLoad(options) {
    this.getPageData(); // 获取页面数据
    // playerStore.dispatch('playBySongIdAction', { id: 1974443814 });
  },
  getPageData() {
    // 获取<轮播图>请求-----------
    // 注意!setData在设置data数据上,是同步的
    // 通过最行的数据对wxml进行渲染时,渲染的过程是异步的
    getBanners().then((res) => this.setData({ banners: res.banners }));
    // 获取<推荐歌曲>请求------------
    rankingStore.dispatch('getRankingDataAction'); //发起共享数据请求
    // 这里这部分逻辑被抽离到getRankingHandler中
    // rankingStore.onState('hotRanking', (res) => {
    //   if (!Object.keys(res).length) return;
    //   const recommendSongs = res.tracks.slice(0, 6);
    //   this.setData({ recommendSongs });
    //   // console.log('拿到了推荐歌曲', this.data.recommendSongs);
    // });
    // 获取<热门/华语歌单>请求-----------
    getSongMenu().then((res) => {
      this.setData({ hotSongMenu: res.playlists });
    });
    getSongMenu('华语').then((res) => {
      this.setData({ chineseSongMenu: res.playlists });
    });
    // 获取榜单请求(getRankingHandler调用后返回一个函数,这里监听返回的这个函数)-------------
    Object.keys(rankingMap).forEach((idx) => rankingStore.onState(rankingMap[idx], this.getRankingHandler(idx))); // 从store中获取共享的数据(若别的地方把state的值改了,这个代码会自动执行,就会做到数据共享+响应式)
    // 播放栏的监听
    playerStore.onStates(['currentSong', 'isPlaying'], ({ currentSong, isPlaying }) => {
      if (currentSong) this.setData({ currentSong });
      if (isPlaying !== undefined) this.setData({ isPlaying });
    });
  },
  handleSearchClick() {
    wx.navigateTo({ url: '/pages/detail-search/detail-search' });
  },
  // 动态获取图片的高度(获取一个组件的高度,而非其原图高度,而且我只需要查询一张图片的高度即可)
  handleSwiperImageLoaded(e) {
    throttleQueryRect('.swiper-image').then((res) => {
      this.setData({ swiperHeight: res[0].height });
    });
  },
  // 关于获取榜单的做法(好好研究,是个前端拿到后端数据做组织的典范)----------------------------
  getRankingHandler(idx) {
    return (res) => {
      if (!Object.keys(res).length) return; //第一次拿到的我们在store中初始化的空对象,当我们有新数据的时候,就可以重新回调这个函数,拿到新数据
      //若是热门榜,则作为推荐歌曲展示------------------------------
      if (rankingMap[idx] === 'hotRanking') {
        const recommendSongs = res.tracks.slice(0, hotSongCount);
        this.setData({ recommendSongs });
        return;
      }
      const name = res.name;
      const coverImgUrl = res.coverImgUrl;
      const playCount = res.playCount;
      const songList = res.tracks.slice(0, 3); //只获取前三个
      const rankingObj = { name, coverImgUrl, playCount, songList };
      // [key]表示key的名称是动态的,到时候传过来0的话,[key]就是0,这时对象解构中的0就会被覆盖为该动态属性的值
      // 太牛逼了下面这行!
      // console.log('getRankingHandler整合store数据,得到榜单信息', this.data.rankings);
      const newRankings = { ...this.data.rankings, [idx]: rankingObj };
      this.setData({ rankings: newRankings });
    };
  },
  handleRankingItemClick(e) {
    const idx = e.currentTarget.dataset.idx;
    this.navigateToDetailSongsPage(rankingMap[idx]);
  },
  handleRefreshClick(e) {
    const itemName = e.currentTarget.dataset.item;
    // 通过wxml设置的itemName来判断是对歌单更新还是对热门歌曲更新
    if (itemName) {
      // 与home-video的追加操作不同,这里是替换为后10条数据,第一次点刷新后offset为10开始
      let offset = this.data.menuRefreshOffset;
      this.setData({ menuRefreshOffset: (offset += menuCount) });
      getSongMenu(itemName, this.data.menuRefreshOffset).then((res) => {
        if (itemName === '全部') {
          this.setData({ hotSongMenu: res.playlists });
        } else if (itemName === '华语') {
          this.setData({ chineseSongMenu: res.playlists });
        }
      });
    } else {
      // 与歌单网络请求不同,hotRanking已在页面onLoad时就请求下来了,所以直接在共享数据中截取
      rankingStore.onState('hotRanking', (res) => {
        let offset = this.data.hotSongRefreshOffset;
        const recommendSongs = res.tracks.slice(offset, offset + hotSongCount);
        this.setData({ recommendSongs, hotSongRefreshOffset: (offset += hotSongCount) });
      });
    }
  },
  handleMoreClick(e) {
    const itemName = e.currentTarget.dataset.item;
    if (itemName) {
      wx.navigateTo({ url: `/pages/detail-menu/detail-menu?itemName=${itemName}` });
    } else {
      this.navigateToDetailSongsPage('hotRanking');
    }
  },
  navigateToDetailSongsPage(rankingName) {
    // 增加type字段来对不同的跳转方式进行区分
    wx.navigateTo({
      url: `/pages/detail-songs/detail-songs?ranking=${rankingName}&type=rank` //跳转通过options拿到
    });
  },
  // 点击歌曲时将该歌曲所在的列表与歌曲在列表中的索引拿到,用于播放列表的实现
  handleSongItemClick(e) {
    const index = e.currentTarget.dataset.index;
    playerStore.setState('playListSongs', this.data.recommendSongs);
    playerStore.setState('playListIndex', index);
    console.log('点击歌曲时将该歌曲所在的列表与歌曲在列表中的索引拿到,用于播放列表的实现', this.data.recommendSongs, index);
  },
  // 注意阻止按钮的冒泡事件(用catchtap替代bindtap)
  handlePlayerClick(e) {
    playerStore.dispatch('changeMusicPlayStatusAction', !this.data.isPlaying);
  },
  handlePlayerBarClick() {
    wx.navigateTo({
      url: `/pages/music-player/music-player?id=${this.data.currentSong.id}`
    });
  }

  // 复杂的做法(要写三个这样的函数,代码存在大量重复)----------------------------
  // getNewRankingHandler(res) {
  //   console.log('getNewRankingHandler', res); //第一次拿到的我们在store中初始化的空对象,当我们有新数据的时候,就可以重新回调这个函数,拿到新数据
  //   // 若对象没有东西则直接返回
  //   if (Object.keys(res).length === 0) return;
  //   const name = res.name;
  //   const coverImgUrl = res.coverImgUrl;
  //   const playCount = res.playCount;
  //   const songList = res.tracks.slice(0, 3);//只获取前三个
  //   const rankingObj = { name, coverImgUrl, songList };
  //   const originRankings = [...this.data.rankingObj];// 把原来的数组浅拷贝
  //   originRankings.push(rankingObj);
  //   console.log(originRankings);
  //   this.setData({ rankings: originRankings });
  // }
});
