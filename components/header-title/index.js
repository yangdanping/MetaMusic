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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleRightClick() {
      // console.log('handleRightClick');
      this.triggerEvent('moreClick'); //发出事件,在使用组件的地方进行bind:moreClick使用
    }
  }
});
