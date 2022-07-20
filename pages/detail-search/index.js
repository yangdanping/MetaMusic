import { getSearchHot, getSearchSuggest } from '../../service/api_search';
import { debounce } from '../../utils/debounce';
const debounceGetSearchSuggest = debounce(getSearchSuggest, 1000);

// pages/detail-search/index.js
Page({
  data: {
    hotKeywords: [],
    suggestSongs: [],
    searchValue: ''
  },

  onLoad(options) {
    // 1.获取页面数据
    this.getPageData();
  },
  getPageData() {
    getSearchHot().then((res) => {
      this.setData({ hotKeywords: res.result.hots });
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
        this.setData({ suggestSongs: res.result.allMatch });
      });
    }
  }
});
