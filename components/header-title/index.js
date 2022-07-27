// components/header-title/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '默认值'
    },
    rightTest: {
      type: String,
      value: '更多'
    },
    showRight: {
      type: Boolean,
      value: true
    },
    showRefresh: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    rotate: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleRightClick() {
      this.triggerEvent('moreClick'); //发出事件,在使用组件的地方进行bind:moreClick使用
    },
    handleRefresh() {
      this.setData({ rotate: true });
      let timer;
      timer && clearTimeout(timer);
      timer = setTimeout(() => this.setData({ rotate: false }), 1500);
      this.triggerEvent('refreshClick'); //发出事件,在使用组件的地方进行bind:moreClick使用
    }
  }
});
