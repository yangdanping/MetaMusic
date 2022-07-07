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

/**
 * 请求MV的详情
 * @param {number} mvid MV的id
 */
export function getMVDetail(mvid) {
  return myRequest.get('/mv/detail', { mvid });
}

/**
 * 请求相关视频
 * @param {number} id MV的id
 */
export function getRelatedVideo(id) {
  return myRequest.get('/related/allvideo', { id });
}
