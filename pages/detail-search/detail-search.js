import { getSearchHot, getSearchSuggest, getSearchResult } from '../../service/api_search';
import debounce from '../../utils/debounce';
const debounceGetSearchSuggest = debounce(getSearchSuggest, 500);

// pages/detail-search/index.js
Page({
  data: {
    hotKeywords: [],
    suggestSongs: [],
    resultSongs: [],
    HasMoreResultSongs: false,
    searchValue: '',
    songsMenu: [
      { name: '爱在西元前' },
      { name: '简单爱' },
      { name: '爷爷泡的茶' },
      { name: '听妈妈的话' },
      { name: '止战之殇' },
      { name: '以父之名' },
      { name: '以父之名' },
      { name: '以父之名' },
      { name: '以父之名' }
    ],
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
    getSearchHot().then((res) => {
      const hotKeywords = res.data.slice(0, 10);
      this.setData({ hotKeywords });
    });
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
      return;
    } else {
      // 4.根据关键字进行搜索
      debounceGetSearchSuggest(searchValue).then((res) => {
        // 1.获取由关键字搜索到的完整的建议歌曲信息
        const suggestSongs = res.result?.allMatch;
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
  onReachBottom() {
    console.log('onReachBottomonReachBottom');
    if (this.data.resultSongs.length) {
      this.setData({ HasMoreResultSongs: true });
      const searchValue = this.data.searchValue;
      this.getSearchResult(searchValue, this.data.resultSongs.length);
    }
  }
});
