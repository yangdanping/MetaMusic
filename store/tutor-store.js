const { HYEventStore } = require('hy-event-store');

const store = new HYEventStore({
  state: {
    // 本地数据
    name: 'ydp',
    age: 24,
    // 网络数据
    banners: [],
    recommends: []
  },
  actions: {
    getHomeDataAction(ctx, payload) {
      ctx.banners = [123, 456, 789];
      console.log('action可以拿到了数据和payload', ctx.banners, payload);
    }
  }
});

// 拿到state中的书籍--------------------
store.onState('name', (res) => {
  console.log('onState拿到了数据,', res);
});
// 设置state中的书籍--------------------
setTimeout(() => store.setState('name', 'NEO'), 1000);

// 进行网络请求拿到数据--------------------
store.dispatch('getHomeDataAction', 123);
