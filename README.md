# MetaMusic - 微信小程序音乐播放器

> 一个基于网易云音乐 API 的微信小程序音乐播放器，支持音乐播放、MV 播放、歌词滚动、背景播放等功能。

## 📋 项目概述

本项目是一个完整的音乐类微信小程序，实现了音乐播放、MV 视频播放、歌曲搜索、榜单展示等核心功能。项目采用**组件化开发**思想，使用**类 Vuex 的状态管理**模式实现多页面数据共享与响应式更新，并封装了**网络请求层**、**工具函数库**等基础设施。

### 技术栈

- **框架**: 微信小程序原生开发
- **UI 组件库**: Vant Weapp
- **状态管理**: hy-event-store（参照 Vuex 实现的轻量级事件驱动状态管理库）
- **网络请求**: 封装的 Promise 化请求类
- **API 服务**: 网易云音乐 API

### 项目亮点

1. **背景音频播放**: 使用 `wx.getBackgroundAudioManager()` 实现应用退出后继续播放
2. **响应式状态管理**: 基于事件订阅的全局状态管理，实现多页面数据同步
3. **歌词同步滚动**: 实时解析歌词并根据播放进度高亮当前歌词
4. **性能优化**: 防抖搜索、节流查询、分页加载等优化手段
5. **组件化架构**: 高复用性的自定义组件设计

---

## 📁 推荐的代码 Review 顺序

为了帮助你渐进式地理解整个项目，建议按以下顺序阅读代码：

### 第一阶段：基础架构

| 顺序 | 文件路径 | 说明 |
|------|----------|------|
| 1 | `app.js` | 应用入口，全局数据初始化与登录逻辑 |
| 2 | `service/index.js` | 网络请求封装层 |
| 3 | `store/index.js` | Store 统一出口 |

### 第二阶段：核心功能 - 音乐播放

| 顺序 | 文件路径 | 说明 |
|------|----------|------|
| 4 | `store/player-store.js` | **核心！** 播放器状态管理 |
| 5 | `store/actions/player-info-actions.js` | 歌曲信息获取 Action |
| 6 | `store/actions/player-update-actions.js` | 播放状态更新 Action |
| 7 | `pages/music-player/music-player.js` | 播放器页面逻辑 |
| 8 | `utils/parse-lyric.js` | 歌词解析工具 |

### 第三阶段：页面与组件

| 顺序 | 文件路径 | 说明 |
|------|----------|------|
| 9 | `pages/home-music/home-music.js` | 音乐首页，榜单/歌单展示 |
| 10 | `pages/detail-search/detail-search.js` | 搜索功能，防抖+富文本高亮 |
| 11 | `pages/detail-video/detail-video.js` | MV/视频播放页 |
| 12 | `components/nav-bar/index.js` | 自定义导航栏组件 |

### 第四阶段：工具函数

| 顺序 | 文件路径 | 说明 |
|------|----------|------|
| 13 | `utils/debounce.js` | 防抖函数封装 |
| 14 | `utils/throttle.js` | 节流函数封装 |

---

## 🎵 核心功能实现详解

### 一、音乐播放功能

#### 1.1 设计思路

音乐播放是本项目的**核心功能**，需要解决以下问题：

1. **多页面共享播放状态**: 播放器页面、首页播放栏、歌曲列表等多处需要同步播放状态
2. **背景播放**: 用户退出小程序后音乐需要继续播放
3. **歌词同步**: 根据播放进度实时高亮当前歌词
4. **播放模式**: 支持顺序播放、单曲循环、随机播放

#### 1.2 技术方案

##### wx.getBackgroundAudioManager() API 介绍

```javascript
// 获取全局唯一的背景音频管理器实例
const audioContext = wx.getBackgroundAudioManager();
```

**关键属性:**
| 属性 | 类型 | 说明 |
|------|------|------|
| `src` | string | 音频数据源，设置后会自动播放 |
| `title` | string | **必填！** 音频标题，用于系统通知栏显示 |
| `singer` | string | 歌手名 |
| `coverImgUrl` | string | 封面图 URL |
| `currentTime` | number | 当前播放位置（秒）- 只读 |
| `duration` | number | 音频总时长（秒）- 只读 |
| `paused` | boolean | 是否暂停 - 只读 |

**关键方法:**
| 方法 | 说明 |
|------|------|
| `play()` | 播放 |
| `pause()` | 暂停 |
| `stop()` | 停止（会清空 src） |
| `seek(position)` | 跳转到指定位置（秒） |

**事件监听:**
| 事件 | 说明 |
|------|------|
| `onPlay(callback)` | 播放开始时触发 |
| `onPause(callback)` | 暂停时触发 |
| `onStop(callback)` | 停止时触发 |
| `onEnded(callback)` | 自然播放结束时触发 |
| `onTimeUpdate(callback)` | 播放进度更新时触发 |
| `onCanplay(callback)` | 音频可以播放时触发 |
| `onPrev(callback)` | 用户在系统控制栏点击"上一首"时触发 |
| `onNext(callback)` | 用户在系统控制栏点击"下一首"时触发 |

#### 1.3 核心代码实现

##### 播放器 Store 设计 (`store/player-store.js`)

```javascript
// 创建全局唯一的背景音频管理器
const audioContext = wx.getBackgroundAudioManager();

const playerStore = new EventStore({
  state: {
    id: 0,                    // 当前歌曲 ID
    currentSong: {},          // 歌曲信息（网络请求获取）
    lyricInfo: [],            // 歌词数组
    durationTime: 0,          // 歌曲总时长
    currentTime: 0,           // 当前播放时长
    currentLyric: '',         // 当前歌词文本
    currentLyricIndex: 0,     // 当前歌词索引
    isPlaying: false,         // 播放状态
    mode: 'order',            // 播放模式: order/repeat/random
    playListSongs: [],        // 播放列表
    playListIndex: 0          // 当前歌曲在列表中的索引
  },
  actions: {
    // 核心：根据歌曲 ID 播放音乐
    playBySongIdAction(ctx, { id, isRefresh = false }) {
      // 避免重复请求同一首歌
      if (id == ctx.id && !isRefresh) {
        this.dispatch('changeMusicPlayStatusAction', true);
        return;
      }
      ctx.id = id;
      // 1. 请求歌曲详情和歌词
      this.dispatch('getCurrentSongAction', id);
      // 2. 设置音频源开始播放
      this.dispatch('setupPlayerAction', id);
      // 3. 首次播放时注册监听器
      if (ctx.isFirstPlay) {
        this.dispatch('setupAudioContextListenerAction', audioContext);
        ctx.isFirstPlay = false;
      }
    },
    // ...其他 actions
  }
});
```

##### 播放器监听器注册 (`store/actions/player-update-actions.js`)

```javascript
export const setupAudioContextListenerAction = (ctx) => {
  // 1. 监听音频可播放状态
  audioContext.onCanplay(() => {
    audioContext.play();
  });

  // 2. 监听播放进度更新（核心：歌词同步）
  audioContext.onTimeUpdate(() => {
    const currentTime = audioContext.currentTime * 1000; // 转为毫秒
    ctx.currentTime = currentTime;
    
    // 根据时间查找当前应该显示的歌词
    const currentIndex = ctx.lyricInfo.findIndex(item => currentTime < item?.time) - 1;
    
    if (ctx.currentLyricIndex !== currentIndex) {
      ctx.currentLyric = ctx.lyricInfo[currentIndex]?.text;
      ctx.currentLyricIndex = currentIndex;
    }
  });

  // 3. 监听播放结束，自动播放下一首
  audioContext.onEnded(() => {
    playerStore.dispatch('changeNewMusicAction', true);
  });

  // 4. 监听播放/暂停状态变化
  audioContext.onPlay(() => { ctx.isPlaying = true; });
  audioContext.onPause(() => { ctx.isPlaying = false; });
};
```

##### 歌词解析 (`utils/parse-lyric.js`)

```javascript
const timeRegExp = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

export function parseLyric(lyricString) {
  // 输入: "[00:18.750]Ooh, let's go!"
  // 输出: [{ time: 18750, text: "Ooh, let's go!" }, ...]
  
  const lyricStrings = lyricString.split('\n');
  return lyricStrings.map(line => {
    const timeResult = timeRegExp.exec(line);
    if (!timeResult) return;
    
    const minute = timeResult[1] * 60 * 1000;
    const second = timeResult[2] * 1000;
    const millsecond = timeResult[3] * (timeResult[3].length === 2 ? 10 : 1);
    const time = minute + second + millsecond;
    const text = line.replace(timeRegExp, '');
    
    return { time, text };
  });
}
```

##### 播放模式切换 (`store/actions/player-update-actions.js`)

```javascript
export const changeNewMusicAction = (ctx, isNext = true) => {
  let index = ctx.playListIndex;
  const playList = ctx.playListSongs;

  switch (ctx.mode) {
    case 'order': // 顺序播放
      index = isNext ? index + 1 : index - 1;
      if (index === playList.length) index = 0;
      if (index === -1) index = playList.length - 1;
      break;
    case 'repeat': // 单曲循环
      // index 不变
      break;
    case 'random': // 随机播放
      do {
        index = Math.floor(Math.random() * playList.length);
      } while (index === ctx.playListIndex);
      break;
  }

  const switchedSong = playList[index] || ctx.currentSong;
  ctx.playListIndex = index;
  playerStore.dispatch('playBySongIdAction', { id: switchedSong.id, isRefresh: true });
};
```

---

### 二、MV/视频播放功能

#### 2.1 设计思路

视频播放页面需要处理：
1. 区分 MV 和普通视频两种类型
2. 视频播放时暂停背景音乐
3. 支持评论分页加载
4. 页面隐藏时支持音频后台播放

#### 2.2 核心代码实现

```javascript
// pages/detail-video/detail-video.js
Page({
  onLoad(options) {
    const { id, type } = options;
    this.getPageData(id, type);
  },

  getPageData(id, type) {
    if (type === 'video') {
      // 普通视频请求
      getVideoURL(id).then(res => this.setData({ mvURLInfo: res.urls[0] }));
      getVideoDetail(id).then(res => {
        this.setData({ mvDetail: res.data });
        getVideoInfo(id).then(res => this.setData({ mvInfo: res }));
      });
    } else {
      // MV 请求
      getMVURL(id).then(res => this.setData({ mvURLInfo: res.data }));
      getMVDetail(id).then(res => {
        this.setData({ mvDetail: res.data });
        getMVInfo(id).then(res => this.setData({ mvInfo: res }));
      });
    }
    // 获取相关视频
    getRelatedVideo(id).then(res => this.setData({ relatedVideos: res.data }));
  },

  // 播放视频时暂停背景音乐
  play(e) {
    let vid = e.currentTarget.id;
    const videoContext = wx.createVideoContext(vid);
    playerStore.dispatch('changeMusicPlayStatusAction', false); // 暂停音乐
    this.setData({ isPlaying: true });
  },

  // 页面隐藏时可继续后台播放音频
  onHide() {
    let bgAudio = wx.getBackgroundAudioManager();
    if (Object.keys(this.data.mvURLInfo).length) {
      bgAudio.singer = this.data.mvDetail.artistName;
      bgAudio.title = this.data.mvDetail.name;
      bgAudio.src = this.data.mvURLInfo.url;
    }
  }
});
```

---

### 三、搜索功能

#### 3.1 设计思路

搜索功能需要考虑：
1. **防抖处理**: 避免频繁请求
2. **富文本高亮**: 搜索建议中高亮匹配的关键字
3. **分页加载**: 搜索结果支持上拉加载更多

#### 3.2 核心代码实现

##### 防抖搜索

```javascript
import debounce from '../../utils/debounce';
const debounceGetSearchSuggest = debounce(getSearchSuggest, 500);

// 输入变化时触发
handleSearchChange(event) {
  const searchValue = event.detail;
  this.setData({ searchValue });

  if (!searchValue.length) {
    this.setData({ suggestSongs: [], resultSongs: [] });
    debounceGetSearchSuggest.cancel(); // 取消已延迟的请求
    return;
  }

  debounceGetSearchSuggest(searchValue).then(res => {
    const suggestSongs = res.result?.allMatch;
    // 生成富文本节点实现高亮...
  });
}
```

##### 富文本高亮实现

```javascript
// 将 "爱在西元前" 转为富文本节点，高亮 "爱" 字
suggestKeywords.forEach(keyword => {
  const nodes = [];
  if (keyword.toUpperCase().startsWith(searchValue.toUpperCase())) {
    // 匹配部分 - 高亮显示
    nodes.push({
      name: 'span',
      attrs: { style: 'color:#26ce8a' },
      children: [{ type: 'text', text: keyword.slice(0, searchValue.length) }]
    });
    // 剩余部分 - 普通显示
    nodes.push({
      name: 'span',
      attrs: { style: 'color:#666;' },
      children: [{ type: 'text', text: keyword.slice(searchValue.length) }]
    });
  }
  suggestSongsNodes.push(nodes);
});
```

---

### 四、状态管理

#### 4.1 hy-event-store 使用说明

本项目使用的 `hy-event-store` 是一个**参照 Vuex 实现的轻量级状态管理库**，基于事件发布/订阅模式，支持：

- **state**: 存储共享数据
- **actions**: 处理异步操作和复杂逻辑
- **onState/onStates**: 监听数据变化（响应式）
- **setState**: 直接修改数据
- **dispatch**: 触发 action

#### 4.2 基本用法

```javascript
import { HYEventStore } from 'hy-event-store';

const store = new EventStore({
  state: {
    name: "初始值",
    list: []
  },
  actions: {
    fetchDataAction(ctx) {
      // ctx 是 state 的代理，直接赋值即可触发响应式更新
      api.getData().then(res => {
        ctx.list = res.data;
      });
    }
  }
});

// 监听单个状态
store.onState("name", (value) => {
  console.log("name 变化了:", value);
});

// 监听多个状态
store.onStates(['name', 'list'], ({ name, list }) => {
  console.log("状态变化:", name, list);
});

// 修改状态
store.setState("name", "新值");

// 触发 action
store.dispatch("fetchDataAction");
```

---

### 五、自定义组件通信

#### 5.1 this.triggerEvent() API 介绍

`triggerEvent` 是小程序**自定义组件向父组件/页面通信**的方式，类似于 Vue 的 `$emit`。

**语法:**
```javascript
this.triggerEvent('事件名', detail对象, options对象)
```

**参数说明:**
| 参数 | 类型 | 说明 |
|------|------|------|
| eventName | string | 自定义事件名称 |
| detail | object | 传递给父组件的数据 |
| options | object | 事件选项（bubbles、composed 等） |

**options 选项:**
| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| bubbles | boolean | false | 事件是否冒泡 |
| composed | boolean | false | 事件是否可以穿越组件边界 |
| capturePhase | boolean | false | 事件是否拥有捕获阶段 |

#### 5.2 使用示例

##### 组件内部 (`components/nav-bar/index.js`)

```javascript
Component({
  methods: {
    handleLeftClick() {
      // 触发自定义事件 'click'，父组件可通过 bind:click 监听
      this.triggerEvent('click');
    }
  }
});
```

##### 组件模板 (`components/nav-bar/index.wxml`)

```html
<view class="left" bindtap="handleLeftClick">
  <image class="icon" src="/assets/images/icons/arrow-left.png" />
</view>
```

##### 父页面使用

```html
<!-- bind:click 监听组件触发的 click 事件 -->
<nav-bar bind:click="goBack">
  <view slot="center" class="tab">歌曲</view>
</nav-bar>
```

```javascript
Page({
  goBack() {
    wx.navigateBack(); // 返回上一页
  }
});
```

---

## 🔧 工具函数

### 防抖函数 (`utils/debounce.js`)

```javascript
export default function debounce(fn, delay, immediate = false) {
  let timer = null;
  let isInvoke = false;

  const _debounce = function (...args) {
    return new Promise((resolve, reject) => {
      if (timer) clearTimeout(timer);

      if (immediate && !isInvoke) {
        resolve(fn.apply(this, args));
        isInvoke = true;
      } else {
        timer = setTimeout(() => {
          resolve(fn.apply(this, args));
          isInvoke = false;
          timer = null;
        }, delay);
      }
    });
  };

  // 支持取消
  _debounce.cancel = function () {
    if (timer) clearTimeout(timer);
    timer = null;
    isInvoke = false;
  };

  return _debounce;
}
```

**使用场景:** 搜索输入框，避免每次输入都发请求

### 节流函数 (`utils/throttle.js`)

```javascript
export default function throttle(fn, interval = 1000, options = { leading: true, trailing: false }) {
  let lastTime = 0;
  let timer = null;

  const _throttle = function(...args) {
    return new Promise((resolve) => {
      const nowTime = new Date().getTime();
      const remainTime = interval - (nowTime - lastTime);
      
      if (remainTime <= 0) {
        if (timer) clearTimeout(timer);
        resolve(fn.apply(this, args));
        lastTime = nowTime;
        return;
      }

      if (options.trailing && !timer) {
        timer = setTimeout(() => {
          resolve(fn.apply(this, args));
          lastTime = new Date().getTime();
          timer = null;
        }, remainTime);
      }
    });
  };

  return _throttle;
}
```

**使用场景:** 图片加载后获取高度，避免频繁计算

---

## 📦 网络请求封装

```javascript
// service/index.js
class MetaRequest {
  constructor(baseURL, authHeader = {}) {
    this.baseURL = baseURL;
    this.authHeader = authHeader;
  }

  request(url, data, method, isAuth = false, header = {}) {
    const finalHeader = isAuth ? { ...this.authHeader, ...header } : header;

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.baseURL}${url}`,
        data,
        method,
        header: finalHeader,
        success: (res) => resolve(res.data),
        fail: (err) => reject(err)
      });
    });
  }

  get(url, params, isAuth = false, header) {
    return this.request(url, params, 'GET', isAuth, header);
  }

  post(url, data, isAuth = false, header) {
    return this.request(url, data, 'POST', isAuth, header);
  }
}

export default new MetaRequest('https://netease-cloud-music-api.vercel.app');
```

---

## 🎯 面试话术总结

### 项目介绍

> "这是一个我独立开发的微信小程序音乐播放器，主要功能包括音乐播放、MV 播放、歌曲搜索、榜单展示等。项目的核心亮点是实现了**背景音频播放**和**歌词同步滚动**功能。"

### 技术亮点

1. **背景播放**: "使用 `wx.getBackgroundAudioManager()` 实现了应用退出后继续播放，并通过事件监听实现了系统控制栏的上一首/下一首操作。"

2. **状态管理**: "为了实现多页面数据共享，我使用了一个基于事件订阅的状态管理库，类似于 Vuex 的设计模式，通过 `onState` 监听数据变化，实现响应式更新。"

3. **歌词同步**: "通过正则表达式解析 LRC 格式歌词，在 `onTimeUpdate` 回调中根据当前播放时间计算应该显示的歌词索引，实现精准的歌词同步。"

4. **性能优化**: "搜索功能使用了**防抖**处理避免频繁请求；轮播图高度计算使用了**节流**；列表数据使用**分页加载**减少首屏渲染压力。"

5. **组件化设计**: "项目采用组件化开发，封装了导航栏、歌曲卡片、视频卡片等通用组件，使用 `triggerEvent` 实现父子组件通信。"

### 遇到的难点

> "印象最深的是处理播放器状态同步的问题。因为多个页面都需要显示播放状态，而且还要支持背景播放，所以我将 `audioContext` 实例和播放状态都放到了全局 Store 中管理，通过事件订阅机制让各个页面能够响应式地更新。"

---

## 📚 项目结构

```
MetaMusic/
├── app.js                      # 应用入口
├── app.json                    # 全局配置
├── app.wxss                    # 全局样式
├── components/                 # 自定义组件
│   ├── nav-bar/               # 导航栏组件
│   ├── music-item-v1/         # 歌曲卡片组件
│   ├── video-item-v1/         # 视频卡片组件
│   └── ...
├── pages/                      # 页面
│   ├── home-music/            # 音乐首页
│   ├── home-video/            # 视频首页
│   ├── music-player/          # 音乐播放器页面
│   ├── detail-video/          # 视频详情页
│   ├── detail-search/         # 搜索页
│   └── ...
├── service/                    # API 接口层
│   ├── index.js               # 请求封装
│   ├── api_music.js           # 音乐相关 API
│   ├── api_player.js          # 播放器相关 API
│   ├── api_video.js           # 视频相关 API
│   └── api_search.js          # 搜索相关 API
├── store/                      # 状态管理
│   ├── index.js               # Store 统一出口
│   ├── player-store.js        # 播放器 Store
│   ├── ranking-store.js       # 榜单 Store
│   └── actions/               # Action 函数
├── utils/                      # 工具函数
│   ├── debounce.js            # 防抖
│   ├── throttle.js            # 节流
│   ├── parse-lyric.js         # 歌词解析
│   └── ...
└── assets/                     # 静态资源
```

---

## 🚀 本地运行

1. 克隆项目到本地
2. 使用微信开发者工具打开项目目录
3. 在 `project.config.json` 中配置自己的 AppID
4. 编译运行

---

## 📝 待优化项

- [ ] 添加播放列表面板
- [ ] 支持歌曲收藏功能
- [ ] 添加用户登录后的个性化推荐
- [ ] 优化首屏加载速度

