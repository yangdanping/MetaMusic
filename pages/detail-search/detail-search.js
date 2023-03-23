import { getSearchHot, getSearchSuggest, getSearchResult } from '../../service/api_search';
import { rankingStore, rankingMap, playerStore } from '../../store/index';

import debounce from '../../utils/debounce';
const debounceGetSearchSuggest = debounce(getSearchSuggest, 500);
const hotKeywordsCount = 10; //热门搜索默认更新10条
const songCount = 9; //热门歌曲默认更新6条
// pages/detail-search/index.js
Page({
  data: {
    hotKeywords: [],
    suggestSongs: [],
    resultSongs: [],
    HasMoreResultSongs: false,
    searchValue: '',
    rankings: { 3779629: {}, 2884035: {}, 19723756: {} }, //若直接是个数组,id顺序就会不好确定
    // 富文本node节点
    suggestSongsNodes: [
      /* 
      // nodes是数组,一个nodes包含如下内容(需要突显的,和不需要的)
        [
         {
            name: 'span',
            attrs: { style: 'color:#26ce8a;' },
            children: [{ type: 'text', text: '爱' }]
         },
                  {
            name: 'span',
            attrs: { style: 'color:#666;' },
            children: [{ type: 'text', text: '在西元前' }]
         },
       ],
       [....],
       [....],
       [....],
      ...
      */
    ]
  },
  onLoad(options) {
    // 1.获取页面数据
    this.getPageData();
  },
  getPageData() {
    rankingStore.dispatch('getRankingDataAction'); //发起共享数据请求
    // 遍历rankingMap,
    Object.keys(rankingMap).forEach((idx) => rankingStore.onState(rankingMap[idx], this.getRankingHandler(idx))); // 从store中获取共享的数据(若别的地方把state的值改了,这个代码会自动执行,就会做到数据共享+响应式)
    getSearchHot().then((res) => {
      const hotKeywords = res.data.slice(0, hotKeywordsCount);
      this.setData({ hotKeywords });
    });
  },
  getRankingHandler(idx) {
    return (res) => {
      console.log('getRankingHandler res', res);
      if (!Object.keys(res).length) return; //第一次拿到的我们在store中初始化的空对象,当我们有新数据的时候,就可以重新回调这个函数,拿到新数据
      //若是热门榜,则作为推荐歌曲展示------------------------------
      if (rankingMap[idx] === 'hotRanking') {
        const recommendSongs = res.tracks.slice(0, songCount);
        this.setData({ recommendSongs });
        return;
      }
      const rankingObj = { name: res.name, songList: res.tracks.slice(0, songCount) };
      const newRankings = { ...this.data.rankings, [idx]: rankingObj };
      this.setData({ rankings: newRankings });
    };
  },
  // 通过bind:change来监听输入时间
  handleSearchChange(event) {
    // 1.获取输入的关键字
    const searchValue = event.detail;
    const suggestSongsNodes = [];
    // console.log('searchValuesearchValuesearchValue', searchValue);
    // 2.保存关键字
    this.setData({ searchValue });
    // 3.判断关键字为空字符的处理逻辑
    if (!searchValue.length) {
      this.setData({ suggestSongs: [], resultSongs: [], suggestSongsNodes: [] }); //符合页面的判断逻辑
      // 注意!就算searchValue为空,防抖后,上一次已延迟的请求已发送,所以要把已网络请求取消掉来解决这个bug
      debounceGetSearchSuggest.cancel();
      return;
    } else {
      // 4.根据关键字进行搜索
      debounceGetSearchSuggest(searchValue).then((res) => {
        // if (!this.data.searchValue.length) {
        //   console.log('searchValue 没有值');
        //   return;
        // }
        // 1.获取由关键字搜索到的完整的建议歌曲信息
        const suggestSongs = res.result?.allMatch;
        console.log('suggestSongssuggestSongssuggestSongs', suggestSongs);
        if (!suggestSongs) return;
        this.setData({ suggestSongs });
        // 2.转成nodes节点,以便实现富文本匹配
        const suggestKeywords = suggestSongs?.map((item) => item.keyword);
        console.log('all suggestKeywords', suggestKeywords);
        // 对输入的关键字进行遍历,并生成节点数组
        // 如打入'爱'字,匹配到['爱在西元前',...]，则'爱'作为node1节点,'在西元前',作为node2节点
        suggestKeywords.forEach((keyword) => {
          const nodes = [];
          //startsWith用来判断当前字符串是否以另外一个给定的子字符串开头,根据判断结果返回true/false
          const needToSlice = keyword.toUpperCase().startsWith(searchValue.toUpperCase());
          // 对匹配进行切割
          if (needToSlice) {
            const key1 = keyword.slice(0, searchValue.length);
            const node1 = {
              name: 'span',
              attrs: { style: 'color:#26ce8a' },
              children: [{ type: 'text', text: key1 }]
            };
            nodes.push(node1);
            const key2 = keyword.slice(searchValue.length);
            const node2 = {
              name: 'span',
              attrs: { style: 'color:#666;' },
              children: [{ type: 'text', text: key2 }]
            };
            nodes.push(node2);
          }
          suggestSongsNodes.push(nodes);
        });
        console.log('获取了rich-text节点列表 suggestSongsNodes', suggestSongsNodes);
        this.setData({ suggestSongsNodes });
      });
    }
  },
  // 回车后的处理搜索结果事件
  handleSearchAction() {
    const searchValue = this.data.searchValue;
    console.log('回车 handleSearchAction', searchValue);
    this.getSearchResult(searchValue);
  },
  handleKeywordItemClick(e) {
    // 获取点击的关键字
    const keyword = e.currentTarget.dataset.keyword;
    // 将关键字设置到searchValue中
    console.log('标签点击 handleKeywordItemClick keywords', keyword);
    this.setData({ searchValue: keyword });
    // 再调用回车事件,子回车事件中拿到已经在这里设置好的searchValue,发送网络请求
    this.handleSearchAction();
  },
  getSearchResult(keywords, offset = 0) {
    let beginLimit = 30;
    let everyLimit = 10;
    let limit = offset === 0 ? beginLimit : everyLimit;
    getSearchResult(keywords, offset, limit).then((res) => {
      console.log('getSearchResult res', res);
      let resultSongs = this.data.resultSongs; //保存原来的数据
      resultSongs = offset === 0 ? res.result.songs : resultSongs.concat(res.result.songs);
      if (!res.result.songCount) {
        this.setData({ HasMoreResultSongs: false, suggestSongs: [] });
        wx.showToast({
          title: '没有更多歌曲了',
          icon: 'none'
        });
      } else {
        this.setData({ resultSongs, HasMoreResultSongs: false, suggestSongs: [] });
      }
    });
  },
  handleSongItemClick(e) {
    const { id } = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/music-player/music-player?id=${id}`
    });
    playerStore.dispatch('playBySongIdAction', { id });
  },
  onReachBottom() {
    console.log('onReachBottomonReachBottom');
    if (this.data.resultSongs.length) {
      this.setData({ HasMoreResultSongs: true });
      const searchValue = this.data.searchValue;
      this.getSearchResult(searchValue, this.data.resultSongs.length);
    }
  }
});
