import { getSearchHot, getSearchSuggest } from '../../service/api_search';
import debounce from '../../utils/debounce';
const debounceGetSearchSuggest = debounce(getSearchSuggest, 1000);

// pages/detail-search/index.js
Page({
  data: {
    hotKeywords: [],
    suggestSongs: [],
    searchValue: '',
    songsMenu: [
      { name: '爱在西元前' },
      { name: '简单爱' },
      { name: '爷爷泡的茶' },
      { name: '听妈妈的话' },
      { name: '以父之名' },
      { name: '以父之名' },
      { name: '以父之名' },
      { name: '以父之名' },
      { name: '以父之名' }
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
  handleSearchClick(event) {
    // 1.获取输入的关键字
    const searchValue = event.detail;
    // 2.保存关键字
    this.setData({ searchValue });
    // 3.判断关键字为空字符的处理逻辑
    if (!searchValue.length) {
      this.setData({ suggestSongs: [] });
      return;
    } else {
      // 4.根据关键字进行搜索
      debounceGetSearchSuggest(searchValue).then((res) => {
        console.log('all suggestSongs', res.result.allMatch);
        this.setData({ suggestSongs: res.result.allMatch });
      });
    }
  },
  handleResultClick(e) {
    const item = e.currentTarget.dataset.item;
    console.log('itemitemitem', item);
  }
});
