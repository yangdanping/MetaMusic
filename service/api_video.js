import myRequest from './index';

export function getTopMVs(offset, limit) {
  return myRequest.get('/top/mv', { offset, limit });
}

/**
 * 文档注释
 * 请求MV的播放地址
 * @param {number} id MV的id
 */
export function getMVURL(id) {
  return myRequest.get('/mv/url', { id });
}

export function getMVDetail(mvid) {
  return myRequest.get('/mv/detail', { mvid });
}

export function getMVInfo(mvid) {
  return myRequest.get('/mv/detail/info', { mvid });
}

export function getMVComment(id, offset) {
  return myRequest.get('/comment/mv', { id, offset });
}

// 视频--------------------------------------------------------------------------------------

export function getRelatedVideo(id) {
  return myRequest.get('/related/allvideo', { id });
}

export function getVideoDetail(id) {
  return myRequest.get('/video/detail', { id });
}

export function getVideoURL(id) {
  return myRequest.get('/video/url', { id });
}

export function getVideoInfo(vid) {
  return myRequest.get('/video/detail/info', { vid });
}
