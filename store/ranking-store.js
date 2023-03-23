import { HYEventStore as EventStore } from 'hy-event-store';
import { getRankings } from '../service/api_music';

// 映射至state的数据结构
// const rankingMap = { 0: 'newRanking', 1: 'hotRanking', 2: 'originRanking', 3: 'upRanking' };
const rankingMap = { 3778678: 'hotRanking', 2884035: 'originRanking', 3779629: 'newRanking', 19723756: 'upRanking' };

const rankingStore = new EventStore({
  state: {
    hotRanking: {}, // 3778678: 热门榜(作为推荐歌曲展示)
    originRanking: {}, // 2884035: 原创榜
    newRanking: {}, // 3779629: 新歌榜
    upRanking: {} // 19723756: 飙升榜
  },
  actions: {
    getRankingDataAction(ctx) {
      Object.keys(rankingMap).forEach((idx) => {
        getRankings(idx)
          .then((res) => {
            const rankingName = rankingMap[idx];
            ctx[rankingName] = res.playlist;
            // console.log(`拿到${ctx[rankingName].name}数据 --> idx:${idx}`, ctx[rankingName]);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  }
});

export { rankingStore, rankingMap };
