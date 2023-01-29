import myRequest from './index';

export function getSongDetail(ids) {
  return myRequest.get('/song/detail',{ids});
}
export function getAlbumDetail(id) {
  return myRequest.get('/album',{id});
}


