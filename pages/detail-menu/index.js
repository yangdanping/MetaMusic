// pages/detail-menu/index.js
import { getSongMenu } from '../../service/api_music';

Page({
  data: {
    playlists: [],
    cat: '',
    hasMore: true //判断是否还有最新数据
  },
  onLoad(options) {
    const { itemName } = options;
    console.log('获得歌单名称', itemName);
    if (itemName === '热门歌单') {
      this.getSongMenu();
    } else if (itemName === '华语歌单') {
      this.getSongMenu('华语');
      this.setData({ cat: '华语' });
    }
  },
  getSongMenu(cat, offset) {
    getSongMenu(cat, offset).then((res) => {
      if (!this.data.hasMore && offset !== 0) return;
      let newData = this.data.playlists;
      console.log('getSongMenu getSongMenu getSongMenu', res);
      newData = offset === 0 ? res.playlists : newData.concat(res.playlists);
      this.setData({ playlists: newData, hasMore: res.more });
    });
  },
  handleMenuItemClick(event) {
    const id = event.currentTarget.dataset.item.id;
    // 增加type字段来对不同的跳转方式进行区分
    wx.navigateTo({
      url: `/pages/detail-songs/index?id=${id}&type=menu`,
      success(res) {
        const item = event.currentTarget.dataset.item;
        res.eventChannel.emit('getMenuData', item); //触发事件
      }
    });
  },
  onReachBottom() {
    console.log('onReachBottom');
    this.getSongMenu(this.data.cat, this.data.playlists.length); // 注意是0~9后面追加10~19,而非替换
  }
});
