// components/detail-header/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentSong: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    title: '',
    description: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showDialog(e) {
      // Dialog.alert({
      //   title: '标题',
      //   message: '弹窗内容'
      // }).then(() => {
      //   console.log('关闭');
      // });
      const description = e.currentTarget.dataset.item.description;
      this.setData({ show: true, description });
    },
    onClose() {
      this.setData({ show: false });
    }
  }
});
