import myRequest from './index';

export function getBanners() {
  return myRequest.get('/banner', { type: 2 });
}
export function getRankings(id) {
  // return myRequest.get('/top/list', { idx });
  return myRequest.get('/playlist/detail', { id });
}
export function getSongMenu(cat = '全部', offset = 0, limit = 6) {
  return myRequest.get('/top/playlist', { cat, offset, limit });
}

export function getSongMenuDetail(id) {
  return myRequest.get('/playlist/detail/dynamic', { id });
}
