import myRequest from './index';

export function getSearchHot() {
  // return myRequest.get('/search/hot');
  return myRequest.get('/search/hot/detail');
}

export function getSearchSuggest(keywords) {
  return myRequest.get('/search/suggest', { keywords, type: 'mobile' });
}
export function getSearchResult(keywords, offset, limit) {
  return myRequest.get('/cloudsearch', { keywords, offset, limit });
}
